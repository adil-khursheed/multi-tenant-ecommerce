import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CheckoutInput } from "@/components/checkout/CheckoutInput";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
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

export function AddressesSection() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressForm, string>>
  >({});

  const { data: addressesData, isLoading } = useQuery(
    trpc.addresses.list.queryOptions(),
  );

  const createAddressMutation = useMutation(
    trpc.addresses.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.addresses.list.queryKey(),
        });
        setForm(EMPTY_FORM);
        setShowForm(false);
      },
      onError: () => {
        Alert.alert("Error", "Failed to save address.");
      },
    }),
  );

  const deleteAddressMutation = useMutation(
    trpc.addresses.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.addresses.list.queryKey(),
        });
      },
      onError: () => {
        Alert.alert("Error", "Failed to delete address.");
      },
    }),
  );

  const addresses = addressesData?.addresses ?? [];

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

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        "Remove Address",
        "Are you sure you want to remove this address?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => deleteAddressMutation.mutate({ id }),
          },
        ],
      );
    },
    [deleteAddressMutation],
  );

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {addresses.length > 0 && !showForm && (
        <View style={styles.addressList}>
          {addresses.map((addr: any) => (
            <View key={addr.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressName}>
                  {addr.firstName} {addr.lastName}
                </Text>
                <Pressable onPress={() => handleDelete(addr.id)}>
                  <Text style={styles.deleteButton}>Remove</Text>
                </Pressable>
              </View>
              <Text style={styles.addressText}>
                {addr.addressLine1}
                {addr.addressLine2 ? `\n${addr.addressLine2}` : ""}
                {"\n"}
                {addr.city}, {addr.state ? `${addr.state} ` : ""}
                {addr.postalCode}
                {"\n"}
                {addr.country}
              </Text>
              {addr.phone ? (
                <Text style={styles.phone}>{addr.phone}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {addresses.length > 0 && !showForm && (
        <Pressable
          style={styles.addButton}
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
          <Text style={styles.addButtonText}>Add New Address</Text>
        </Pressable>
      )}

      {(!addresses.length || showForm) && (
        <View style={styles.form}>
          {showForm && addresses.length > 0 && (
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
              {createAddressMutation.isPending ? "Saving..." : "Save Address"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(spacing[4]),
  },
  addressList: {
    gap: verticalScale(spacing[3]),
  },
  addressCard: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: horizontalScale(spacing[4]),
    backgroundColor: colors.card,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(spacing[2]),
  },
  addressName: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  addressText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    lineHeight: moderateScale(fontSizes.sm * 1.5),
    marginBottom: verticalScale(spacing[2]),
  },
  phone: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
  },
  deleteButton: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: horizontalScale(spacing[2]),
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radii.md,
    paddingVertical: verticalScale(spacing[3]),
  },
  addButtonText: {
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
    borderRadius: radii.sm,
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
  emptyContainer: {
    paddingVertical: verticalScale(spacing[8]),
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
});
