"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  type ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { auth } from "@/utilities/firebase";

const OTP_COOLDOWN_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 3;

interface UsePhoneVerificationReturn {
  /** Send OTP to the given phone number */
  sendOTP: (phoneNumber: string) => Promise<boolean>;
  /** Verify the OTP entered by the user */
  verifyOTP: (otp: string) => Promise<boolean>;
  /** Whether an OTP operation is in progress */
  isLoading: boolean;
  /** Error message, if any */
  error: string | null;
  /** Remaining cooldown seconds before resend is allowed */
  cooldown: number;
  /** Whether the OTP has been sent and we're waiting for user input */
  otpSent: boolean;
  /** Number of resend attempts used */
  resendCount: number;
  /** Whether the max resend attempts have been reached */
  maxResendsReached: boolean;
  /** Reset state (e.g., when phone number changes) */
  reset: () => void;
}

export function usePhoneVerification(): UsePhoneVerificationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Clean up cooldown interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  /**
   * Initialize the invisible reCAPTCHA verifier.
   * Attaches to a hidden div — the user sees nothing.
   */
  const getRecaptchaVerifier = useCallback(() => {
    // Reuse existing verifier if available
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    // Ensure the container exists
    let container = document.getElementById("recaptcha-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "recaptcha-container";
      document.body.appendChild(container);
    }

    const verifier = new RecaptchaVerifier(auth, container, {
      size: "invisible",
    });

    recaptchaVerifierRef.current = verifier;
    return verifier;
  }, []);

  /**
   * Start the cooldown timer after sending an OTP.
   */
  const startCooldown = useCallback(() => {
    setCooldown(OTP_COOLDOWN_SECONDS);

    // Clear any existing interval
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }

    cooldownIntervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
            cooldownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Send OTP to the given phone number.
   * Phone number must be in E.164 format (e.g., +919876543210).
   */
  const sendOTP = useCallback(
    async (phoneNumber: string): Promise<boolean> => {
      // Guard: cooldown active
      if (cooldown > 0) {
        setError(`Please wait ${cooldown}s before resending.`);
        return false;
      }

      // Guard: max resends reached
      if (resendCount >= MAX_RESEND_ATTEMPTS) {
        setError("Maximum resend attempts reached. Please try again later.");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const recaptchaVerifier = getRecaptchaVerifier();

        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          recaptchaVerifier,
        );

        confirmationResultRef.current = confirmationResult;
        setOtpSent(true);
        setResendCount((prev) => prev + 1);
        startCooldown();

        return true;
      } catch (err: unknown) {
        // Reset reCAPTCHA verifier on error so it can be re-created
        recaptchaVerifierRef.current = null;

        const firebaseError = err as { code?: string; message?: string };

        switch (firebaseError.code) {
          case "auth/invalid-phone-number":
            setError("Invalid phone number. Please check and try again.");
            break;
          case "auth/too-many-requests":
            setError("Too many attempts. Please try again later.");
            break;
          case "auth/quota-exceeded":
            setError("SMS quota exceeded. Please try again later.");
            break;
          case "auth/captcha-check-failed":
            setError("reCAPTCHA verification failed. Please try again.");
            break;
          default:
            setError(
              firebaseError.message ?? "Failed to send OTP. Please try again.",
            );
        }

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [cooldown, resendCount, getRecaptchaVerifier, startCooldown],
  );

  /**
   * Verify the OTP entered by the user.
   */
  const verifyOTP = useCallback(async (otp: string): Promise<boolean> => {
    if (!confirmationResultRef.current) {
      setError("No OTP was sent. Please request a new one.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await confirmationResultRef.current.confirm(otp);

      // Clean up — sign out from Firebase since we only use it for verification,
      // not as our primary auth system (Payload handles that).
      await auth.signOut();

      return true;
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };

      switch (firebaseError.code) {
        case "auth/invalid-verification-code":
          setError("Invalid OTP. Please check and try again.");
          break;
        case "auth/code-expired":
          setError("OTP has expired. Please request a new one.");
          setOtpSent(false);
          confirmationResultRef.current = null;
          break;
        default:
          setError("Verification failed. Please try again.");
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset all state — call this when the phone number changes
   * so stale OTP state doesn't persist.
   */
  const reset = useCallback(() => {
    setError(null);
    setOtpSent(false);
    setCooldown(0);
    setResendCount(0);
    confirmationResultRef.current = null;

    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
  }, []);

  return {
    sendOTP,
    verifyOTP,
    isLoading,
    error,
    cooldown,
    otpSent,
    resendCount,
    maxResendsReached: resendCount >= MAX_RESEND_ATTEMPTS,
    reset,
  };
}
