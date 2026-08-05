import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { AddressCard } from "@/components/checkout/AddressCard";
import { CheckoutInput } from "@/components/checkout/CheckoutInput";
import { StepHeader } from "@/components/checkout/StepHeader";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { useAuth } from "@/providers/Auth";
import { useCheckout } from "@/providers/Checkout";
import { useTRPC } from "@/utils/api";

type AddressForm = {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const EMPTY_FORM: AddressForm = {
  firstName: "",
  lastName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
};

export default function CheckoutAddress() {
  const { user } = useAuth();
  const { billingAddress, setBillingAddress } = useCheckout();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressForm, string>>
  >({});

  const { data: addressesData, isLoading: addressesLoading } = useQuery(
    trpc.addresses.list.queryOptions(undefined, {
      enabled: !!user,
    }),
  );

  const createAddressMutation = useMutation(
    trpc.addresses.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.addresses.list.queryKey(),
        });
        setBillingAddress(data.address as any);
        setShowForm(false);
      },
    }),
  );

  const addresses = addressesData?.addresses ?? [];
  const hasSavedAddresses = addresses.length > 0 && !showForm;

  const updateField = useCallback(
    (field: keyof AddressForm, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof AddressForm, string>> = {};
    if (!form.firstName.trim()) newErrors.firstName = "Required";
    if (!form.lastName.trim()) newErrors.lastName = "Required";
    if (!form.addressLine1.trim()) newErrors.addressLine1 = "Required";
    if (!form.city.trim()) newErrors.city = "Required";
    if (!form.postalCode.trim()) newErrors.postalCode = "Required";
    if (!form.country.trim()) newErrors.country = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;
    createAddressMutation.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || undefined,
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim() || undefined,
      postalCode: form.postalCode.trim(),
      country: form.country.trim() as "IN",
    });
  }, [form, validate, createAddressMutation]);

  const handleSelectAddress = useCallback(
    (addr: any) => {
      setBillingAddress({
        firstName: addr.firstName,
        lastName: addr.lastName,
        phone: addr.phone || undefined,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || undefined,
        city: addr.city,
        state: addr.state || undefined,
        postalCode: addr.postalCode,
        country: addr.country,
      });
    },
    [setBillingAddress],
  );

  const canContinue = billingAddress && !showForm;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: top + verticalScale(spacing[4]),
          paddingBottom: bottom + verticalScale(spacing[4]),
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StepHeader
          number="02"
          title="Delivery Address"
          subtitle="Where should we send your order?"
          isCurrent
        />

        {hasSavedAddresses && (
          <>
            <View style={styles.addressList}>
              {addresses.map((addr: any) => (
                <AddressCard
                  key={addr.id}
                  address={{
                    firstName: addr.firstName,
                    lastName: addr.lastName,
                    phone: addr.phone,
                    addressLine1: addr.addressLine1,
                    addressLine2: addr.addressLine2,
                    city: addr.city,
                    state: addr.state,
                    postalCode: addr.postalCode,
                    country: addr.country,
                    id: addr.id,
                  }}
                  isSelected={
                    billingAddress?.addressLine1 === addr.addressLine1
                  }
                  onSelect={() => handleSelectAddress(addr)}
                />
              ))}
            </View>

            <Pressable
              style={styles.addNewButton}
              onPress={() => {
                setShowForm(true);
                setForm(EMPTY_FORM);
              }}
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                size={16}
                color={colors.mutedForeground}
                strokeWidth={1.5}
              />
              <Text style={styles.addNewText}>Add New Address</Text>
            </Pressable>
          </>
        )}

        {(!hasSavedAddresses || showForm) && (
          <View style={styles.form}>
            {showForm && hasSavedAddresses && (
              <View style={styles.formHeader}>
                <Text style={styles.formHeaderText}>New address</Text>
                <Pressable onPress={() => setShowForm(false)}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.nameRow}>
              <View style={styles.halfField}>
                <CheckoutInput
                  label="First name"
                  required
                  value={form.firstName}
                  onChangeText={(v) => updateField("firstName", v)}
                  error={errors.firstName}
                  placeholder="John"
                />
              </View>
              <View style={styles.halfField}>
                <CheckoutInput
                  label="Last name"
                  required
                  value={form.lastName}
                  onChangeText={(v) => updateField("lastName", v)}
                  error={errors.lastName}
                  placeholder="Doe"
                />
              </View>
            </View>

            <CheckoutInput
              label="Phone"
              value={form.phone}
              onChangeText={(v) => updateField("phone", v)}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
            />

            <CheckoutInput
              label="Address line 1"
              required
              value={form.addressLine1}
              onChangeText={(v) => updateField("addressLine1", v)}
              error={errors.addressLine1}
              placeholder="Street address"
            />

            <CheckoutInput
              label="Address line 2"
              value={form.addressLine2}
              onChangeText={(v) => updateField("addressLine2", v)}
              placeholder="Apt, suite, etc. (optional)"
            />

            <View style={styles.cityRow}>
              <View style={styles.cityField}>
                <CheckoutInput
                  label="City"
                  required
                  value={form.city}
                  onChangeText={(v) => updateField("city", v)}
                  error={errors.city}
                  placeholder="Mumbai"
                />
              </View>
              <View style={styles.halfField}>
                <CheckoutInput
                  label="State"
                  value={form.state}
                  onChangeText={(v) => updateField("state", v)}
                  placeholder="MH"
                />
              </View>
            </View>

            <View style={styles.codeRow}>
              <View style={styles.halfField}>
                <CheckoutInput
                  label="Postal code"
                  required
                  value={form.postalCode}
                  onChangeText={(v) => updateField("postalCode", v)}
                  error={errors.postalCode}
                  placeholder="400001"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <CheckoutInput
                  label="Country"
                  required
                  value={form.country}
                  onChangeText={(v) => updateField("country", v)}
                  error={errors.country}
                  placeholder="IN"
                />
              </View>
            </View>

            <Pressable
              style={[
                styles.submitButton,
                createAddressMutation.isPending && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={createAddressMutation.isPending}
            >
              <Text style={styles.submitButtonText}>
                {createAddressMutation.isPending
                  ? "Saving..."
                  : "Use this Address"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {canContinue && (
        <View style={[styles.bottomBar, { bottom }]}>
          <Pressable
            style={styles.continueButton}
            onPress={() => router.push("/(shop)/checkout/payment")}
          >
            <Text style={styles.continueButtonText}>Continue to Payment →</Text>
          </Pressable>
        </View>
      )}
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
  addressList: {
    gap: verticalScale(spacing[3]),
    marginBottom: verticalScale(spacing[4]),
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: horizontalScale(spacing[2]),
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    paddingVertical: verticalScale(spacing[3]),
    marginBottom: verticalScale(spacing[4]),
  },
  addNewText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  form: {
    gap: verticalScale(spacing[3]),
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(spacing[2]),
  },
  formHeaderText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cancelButton: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.primary,
  },
  nameRow: {
    flexDirection: "row",
    gap: horizontalScale(spacing[3]),
  },
  halfField: {
    flex: 1,
  },
  cityRow: {
    flexDirection: "row",
    gap: horizontalScale(spacing[3]),
  },
  cityField: {
    flex: 2,
  },
  codeRow: {
    flexDirection: "row",
    gap: horizontalScale(spacing[3]),
  },
  submitButton: {
    backgroundColor: colors.foreground,
    paddingVertical: verticalScale(spacing[3]),
    alignItems: "center",
    marginTop: verticalScale(spacing[2]),
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
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
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(spacing[4]),
    alignItems: "center",
  },
  continueButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
