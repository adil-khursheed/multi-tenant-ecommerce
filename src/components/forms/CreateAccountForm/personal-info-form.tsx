import { Activity, useEffect, useRef, useState } from "react";
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import {
  CheckmarkCircle01Icon,
  Eye,
  EyeOff,
  LockPasswordIcon,
  Mail,
  User,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { CountrySelect, PhoneInput } from "@/components/ui/phone-input";
import { Spinner } from "@/components/ui/spinner";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { cn } from "@/utilities/cn";
import { type CreateAccountFormData } from "./createAccountSchema";

const PersonalInfoForm = ({
  control,
  setValue,
  watch,
}: {
  control: Control<CreateAccountFormData>;
  setValue: UseFormSetValue<CreateAccountFormData>;
  watch: UseFormWatch<CreateAccountFormData>;
}) => {
  const [toggleCreatePassword, setToggleCreatePassword] = useState(false);
  const [toggleConfirmPassword, setToggleConfirmPassword] = useState(false);

  const isPhoneVerified = watch("isPhoneVerified");
  const phone = watch("phone");

  const {
    sendOTP,
    verifyOTP,
    isLoading: isOTPLoading,
    error: otpError,
    cooldown,
    otpSent,
    maxResendsReached,
    reset: resetOTP,
  } = usePhoneVerification();

  // Reset OTP state when the phone number changes
  const prevPhoneRef = useRef(phone);
  useEffect(() => {
    if (prevPhoneRef.current !== phone) {
      prevPhoneRef.current = phone;
      setValue("isPhoneVerified", false);
      setValue("otp", "");
      resetOTP();
    }
  }, [phone, setValue, resetOTP]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) return;
    await sendOTP(phone);
  };

  const handleVerifyOTP = async (otp: string) => {
    const success = await verifyOTP(otp);
    if (success) {
      setValue("isPhoneVerified", true);
    }
  };

  return (
    <>
      <Field orientation={"horizontal"} className="gap-6">
        <Controller
          control={control}
          name="firstName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                required
                className="text-xs uppercase tracking-[0.15em]"
              >
                First Name
              </FieldLabel>
              <InputGroup aria-invalid={fieldState.invalid} className="h-12">
                <InputGroupInput
                  {...field}
                  id="signup-firstName"
                  placeholder="Arjun"
                />
                <InputGroupAddon align={"inline-start"}>
                  <HugeiconsIcon icon={User} />
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs uppercase tracking-[0.15em]">
                Last Name
              </FieldLabel>
              <InputGroup aria-invalid={fieldState.invalid} className="h-12">
                <InputGroupInput
                  {...field}
                  id="signup-lastName"
                  placeholder="Kumar"
                />
                <InputGroupAddon align={"inline-start"}>
                  <HugeiconsIcon icon={User} />
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </Field>

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Email Address
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput
                {...field}
                id="signup-email"
                type="email"
                placeholder="arjun@editorial.com"
              />
              <InputGroupAddon align={"inline-start"}>
                <HugeiconsIcon icon={Mail} />
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Phone Number
            </FieldLabel>
            <PhoneInput
              {...field}
              placeholder="Enter phone number"
              countrySelectComponent={(props) => (
                <CountrySelect
                  {...props}
                  countryCodeClassName={cn(
                    "font-medium border-r-0",
                    fieldState.invalid ? "border-negative" : "border-input",
                  )}
                  className={cn(
                    "",
                    fieldState.invalid ? "border-negative" : "border-input",
                  )}
                />
              )}
              inputComponent={(props) => (
                <InputGroup className="h-12">
                  <InputGroupInput
                    {...props}
                    id="signup-phone"
                    type="tel"
                    placeholder="Enter phone number"
                  />

                  <InputGroupAddon align={"inline-end"}>
                    {isPhoneVerified ? (
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        className="text-positive"
                      />
                    ) : (
                      <InputGroupButton
                        variant={"link"}
                        size={"sm"}
                        onClick={handleSendOTP}
                        disabled={
                          isOTPLoading || cooldown > 0 || maxResendsReached
                        }
                      >
                        {isOTPLoading ? (
                          <Spinner />
                        ) : cooldown > 0 ? (
                          `Resend (${cooldown}s)`
                        ) : otpSent ? (
                          "Resend OTP"
                        ) : (
                          "Verify"
                        )}
                      </InputGroupButton>
                    )}
                  </InputGroupAddon>
                </InputGroup>
              )}
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            {otpError && (
              <p className="text-negative text-xs mt-1">{otpError}</p>
            )}
          </Field>
        )}
      />

      <Activity mode={otpSent && !isPhoneVerified ? "visible" : "hidden"}>
        <Controller
          control={control}
          name="otp"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                required
                className="text-xs uppercase tracking-[0.15em]"
              >
                OTP
              </FieldLabel>
              <InputOTP
                {...field}
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                disabled={isOTPLoading}
                onComplete={handleVerifyOTP}
              >
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:flex-1 *:data-[slot=input-otp-slot]:text-xs/relaxed w-full">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>
                Please enter the one-time password sent to your phone.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </Activity>

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Create Password
            </FieldLabel>
            <InputGroup aria-invalid={fieldState.invalid} className="h-12">
              <InputGroupInput
                {...field}
                id="signup-password"
                type={toggleCreatePassword ? "text" : "password"}
                placeholder="••••••••"
              />
              <InputGroupAddon align={"inline-start"}>
                <HugeiconsIcon icon={LockPasswordIcon} />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Show Password"
                  title="Show Password"
                  size="icon-xs"
                  onClick={() => setToggleCreatePassword((prev) => !prev)}
                >
                  {toggleCreatePassword ? (
                    <HugeiconsIcon icon={EyeOff} />
                  ) : (
                    <HugeiconsIcon icon={Eye} />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="passwordConfirm"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              required
              className="text-xs uppercase tracking-[0.15em]"
            >
              Confirm Password
            </FieldLabel>
            <InputGroup className="h-12">
              <InputGroupInput
                {...field}
                id="signup-password-confirm"
                aria-invalid={fieldState.invalid}
                type={toggleConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
              />
              <InputGroupAddon align={"inline-start"}>
                <HugeiconsIcon icon={LockPasswordIcon} />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Show Password"
                  title="Show Password"
                  size="icon-xs"
                  onClick={() => setToggleConfirmPassword((prev) => !prev)}
                >
                  {toggleConfirmPassword ? (
                    <HugeiconsIcon icon={EyeOff} />
                  ) : (
                    <HugeiconsIcon icon={Eye} />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  );
};

export default PersonalInfoForm;
