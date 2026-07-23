import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import {
  MapPinIcon,
  CreditCardIcon,
  Cash01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import RazorpayCheckout from "react-native-razorpay";

import { useAuth } from "@/providers/Auth";
import { useCart } from "@/providers/Cart";
import { useCurrency } from "@/providers/Currency";
import { useCheckout } from "@/providers/Checkout";
import { useTRPC } from "@/utils/api";
import { StepHeader } from "@/components/checkout/StepHeader";
import { OrderSummaryItems } from "@/components/checkout/OrderSummaryItems";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { horizontalScale, verticalScale, moderateScale } from "@/constants/responsive";

export default function CheckoutReview() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const trpc = useTRPC();
  const {
    billingAddress,
    selectedPaymentMethod,
    paymentData,
    setCompletedOrderId,
    setError,
  } = useCheckout();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  const confirmMutation = useMutation(
    trpc.payments.confirm.mutationOptions({
      onSuccess: async (data) => {
        setCompletedOrderId(String(data.orderID));
        await clearCart();
        router.replace("/(shop)/checkout/success");
      },
      onError: (err) => {
        setLocalError(err.message || "Order confirmation failed");
        setIsProcessing(false);
      },
    }),
  );

  const handleRazorpayPayment = useCallback(() => {
    if (!paymentData?.razorpayOrderID || !paymentData?.keyId) {
      setLocalError("Payment data is missing. Please go back and try again.");
      return;
    }

    setIsProcessing(true);
    setLocalError(null);

    const options = {
      key: paymentData.keyId as string,
      amount: paymentData.amount as number,
      currency: paymentData.currency as string,
      name: "Store",
      order_id: paymentData.razorpayOrderID as string,
      prefill: {
        email: user?.email || "",
        contact: billingAddress?.phone || undefined,
      },
      theme: {
        color: "#914216",
      },
    };

    try {
      RazorpayCheckout.open(options)
        .then((response: any) => {
          confirmMutation.mutate({
            method: "razorpay",
            razorpayPaymentID: response.razorpay_payment_id,
            razorpayOrderID: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
        })
        .catch((error: any) => {
          if (error?.code !== 0) {
            setLocalError(error?.description || "Payment failed");
          }
          setIsProcessing(false);
        });
    } catch (err) {
      setLocalError("Failed to open Razorpay");
      setIsProcessing(false);
    }
  }, [paymentData, user, billingAddress, confirmMutation]);

  const handleCODConfirm = useCallback(() => {
    if (!paymentData?.transactionID) {
      setLocalError("Transaction data is missing.");
      return;
    }
    setIsProcessing(true);
    setLocalError(null);
    confirmMutation.mutate({
      method: "cod",
      transactionID: paymentData.transactionID as string,
    });
  }, [paymentData, confirmMutation]);

  if (!billingAddress) {
    return (
      <View style={[styles.container, { paddingTop: top + verticalScale(spacing[4]) }]}>
        <Text style={styles.errorText}>Please select an address first.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top + verticalScale(spacing[4]) }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StepHeader
          number="04"
          title="Review Order"
          isCurrent
        />

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <HugeiconsIcon
                icon={MapPinIcon}
                size={16}
                color={colors.mutedForeground}
                strokeWidth={1.5}
              />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.changeButton}>Change</Text>
            </Pressable>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.addressName}>
              {billingAddress.firstName} {billingAddress.lastName}
            </Text>
            <Text style={styles.addressLine}>
              {billingAddress.addressLine1}
            </Text>
            {billingAddress.addressLine2 ? (
              <Text style={styles.addressLine}>{billingAddress.addressLine2}</Text>
            ) : null}
            <Text style={styles.addressLine}>
              {billingAddress.city}, {billingAddress.state ? `${billingAddress.state} ` : ""}
              {billingAddress.postalCode}
            </Text>
            <Text style={styles.addressLine}>{billingAddress.country}</Text>
            {billingAddress.phone ? (
              <Text style={styles.addressPhone}>{billingAddress.phone}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <HugeiconsIcon
                icon={selectedPaymentMethod === "cod" ? Cash01Icon : CreditCardIcon}
                size={16}
                color={colors.mutedForeground}
                strokeWidth={1.5}
              />
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.changeButton}>Change</Text>
            </Pressable>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.paymentMethod}>
              {selectedPaymentMethod === "cod"
                ? "Cash on Delivery"
                : "Razorpay"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderSimple}>
            <Text style={styles.sectionTitle}>
              Items ({items.reduce((s, i) => s + i.quantity, 0)})
            </Text>
          </View>
          <View style={styles.sectionContent}>
            <OrderSummaryItems items={items} />
          </View>
        </View>

        <View style={styles.trustBadge}>
          <HugeiconsIcon
            icon={Shield01Icon}
            size={16}
            color={colors.mutedForeground}
            strokeWidth={1.5}
          />
          <Text style={styles.trustText}>
            Secure checkout. Your data is protected.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={selectedPaymentMethod === "razorpay" ? handleRazorpayPayment : handleCODConfirm}
          disabled={isProcessing}
        >
          <Text style={styles.payButtonText}>
            {isProcessing
              ? "Processing..."
              : selectedPaymentMethod === "cod"
                ? "Place Order (COD)"
                : "Pay with Razorpay"}
          </Text>
        </Pressable>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isProcessing}
        >
          <Text style={styles.backButtonText}>Back to Payment</Text>
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
    paddingBottom: verticalScale(spacing[24]),
  },
  errorText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: verticalScale(spacing[8]),
  },
  errorBanner: {
    backgroundColor: `${colors.destructive}10`,
    borderWidth: 1,
    borderColor: `${colors.destructive}30`,
    borderRadius: radii.sm,
    padding: horizontalScale(spacing[3]),
    marginBottom: verticalScale(spacing[4]),
  },
  errorBannerText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.destructive,
  },
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    marginBottom: verticalScale(spacing[3]),
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
  },
  sectionHeaderSimple: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  changeButton: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.primary,
  },
  sectionContent: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
  },
  addressName: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
    marginBottom: verticalScale(spacing[1]),
  },
  addressLine: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    lineHeight: moderateScale(fontSizes.sm * 1.4),
  },
  addressPhone: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
    marginTop: verticalScale(spacing[1]),
  },
  paymentMethod: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: horizontalScale(spacing[2]),
    paddingVertical: verticalScale(spacing[4]),
  },
  trustText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[3]),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: verticalScale(spacing[2]),
  },
  payButton: {
    backgroundColor: colors.foreground,
    borderRadius: radii.sm,
    paddingVertical: verticalScale(spacing[4]),
    alignItems: "center",
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  backButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: verticalScale(spacing[3]),
    alignItems: "center",
  },
  backButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
