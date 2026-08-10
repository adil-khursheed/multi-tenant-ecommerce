import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { PaymentMethodCard } from "@/components/checkout/PaymentMethodCard";
import { StepHeader } from "@/components/checkout/StepHeader";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { useCheckout } from "@/providers/Checkout";
import { useTRPC } from "@/utils/api";

export default function CheckoutPayment() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    billingAddress,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    setPaymentData,
    setError,
  } = useCheckout();

  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  const initiateMutation = useMutation(
    trpc.payments.initiate.mutationOptions({
      onSuccess: (data) => {
        setPaymentData(data as Record<string, unknown>);
        setError(null);
        router.push("/(shop)/checkout/review");
      },
      onError: (err) => {
        let msg = "Failed to initiate payment. Please try again.";
        if (err.message?.includes("OutOfStock")) {
          msg = "One or more items in your cart are out of stock.";
        }
        setLocalError(msg);
      },
      onSettled: () => {
        setIsInitiating(false);
      },
    }),
  );

  const handleProceed = useCallback(() => {
    setLocalError(null);
    setIsInitiating(true);
    initiateMutation.mutate({
      method: selectedPaymentMethod,
      billingAddress: billingAddress ?? undefined,
    });
  }, [selectedPaymentMethod, initiateMutation, billingAddress]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: top + verticalScale(spacing[4]) },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StepHeader
          number="03"
          title="Payment"
          subtitle="All transactions are 256-bit SSL encrypted."
          isCurrent
        />

        {error && (
          <View style={styles.errorBanner}>
            <HugeiconsIcon
              icon={AlertCircleIcon}
              size={18}
              color={colors.destructive}
              strokeWidth={1.5}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.methods}>
          <PaymentMethodCard
            method="razorpay"
            isSelected={selectedPaymentMethod === "razorpay"}
            onSelect={() => {
              setSelectedPaymentMethod("razorpay");
              setLocalError(null);
            }}
          />
          <PaymentMethodCard
            method="cod"
            isSelected={selectedPaymentMethod === "cod"}
            onSelect={() => {
              setSelectedPaymentMethod("cod");
              setLocalError(null);
            }}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            {selectedPaymentMethod === "cod"
              ? "Cash on Delivery"
              : "Pay with Razorpay"}
          </Text>
          <Text style={styles.infoDescription}>
            {selectedPaymentMethod === "cod"
              ? "Pay in cash when your order arrives. A convenience fee of ₹50 applies to all COD orders."
              : "You will be securely redirected to Razorpay where you can pay using Credit/Debit Card, UPI, Netbanking, or Wallets."}
          </Text>
        </View>

        <View style={styles.features}>
          {selectedPaymentMethod === "razorpay" ? (
            <>
              <View style={styles.featureRow}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>
                  Supports Cards, UPI, Netbanking & Wallets
                </Text>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>
                  256-bit SSL encrypted & secure
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.featureRow}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>
                  Please keep exact change ready
                </Text>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>
                  Order confirmation SMS will be sent
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { bottom }]}>
        <Pressable
          style={[
            styles.proceedButton,
            isInitiating && styles.proceedButtonDisabled,
          ]}
          onPress={handleProceed}
          disabled={isInitiating}
        >
          <Text style={styles.proceedButtonText}>
            {isInitiating
              ? "Processing..."
              : selectedPaymentMethod === "cod"
                ? "Place Order"
                : "Proceed to Pay"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingBottom: verticalScale(spacing[20]),
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
    backgroundColor: `${colors.destructive}10`,
    borderWidth: 1,
    borderColor: `${colors.destructive}30`,
    padding: horizontalScale(spacing[3]),
    marginBottom: verticalScale(spacing[4]),
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.destructive,
    lineHeight: moderateScale(fontSizes.sm * 1.4),
  },
  methods: {
    gap: verticalScale(spacing[3]),
    marginBottom: verticalScale(spacing[4]),
  },
  infoCard: {
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    padding: horizontalScale(spacing[4]),
    alignItems: "center",
    marginBottom: verticalScale(spacing[4]),
  },
  infoTitle: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes.lg),
    color: colors.foreground,
    marginBottom: verticalScale(spacing[1]),
  },
  infoDescription: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: moderateScale(fontSizes.sm * 1.5),
  },
  features: {
    gap: verticalScale(spacing[2]),
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
  },
  featureDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  featureText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
  bottomBar: {
    position: "absolute",
    // bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  proceedButton: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(spacing[4]),
    alignItems: "center",
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  proceedButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
