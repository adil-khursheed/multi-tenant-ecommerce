import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  CheckmarkBadge01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";

import { colors, fonts, fontSizes, spacing, radii, shadows } from "@/constants/theme";
import { moderateScale, horizontalScale, verticalScale } from "@/constants/responsive";

type Tenant = {
  id?: string | number;
  storeName?: string | null;
  storeDescription?: string | null;
  storeLogo?:
    | string
    | { url?: string | null; [k: string]: unknown }
    | null;
  verificationStatus?: string | null;
};

type VendorCardProps = {
  tenant?: Tenant | null;
  onVisitStore?: (tenantId: string | number) => void;
};

export function VendorCard({ tenant, onVisitStore }: VendorCardProps) {
  if (!tenant) return null;

  const isVerified = tenant.verificationStatus === "approved";

  const logoUrl =
    tenant.storeLogo && typeof tenant.storeLogo === "object" && "url" in tenant.storeLogo
      ? tenant.storeLogo.url
      : typeof tenant.storeLogo === "string"
        ? tenant.storeLogo
        : null;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.logoContainer}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.logo}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.logo, styles.logoPlaceholder]}>
              <Text style={styles.logoFallback}>
                {tenant.storeName?.substring(0, 2).toUpperCase() || "ST"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.storeName} numberOfLines={1}>
              {tenant.storeName}
            </Text>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <HugeiconsIcon
                  icon={CheckmarkBadge01Icon}
                  size={moderateScale(12)}
                  color={colors.primary}
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          {tenant.storeDescription ? (
            <Text style={styles.description} numberOfLines={2}>
              {tenant.storeDescription}
            </Text>
          ) : null}
        </View>
      </View>

      <Pressable
        style={styles.visitButton}
        onPress={() => tenant.id && onVisitStore?.(tenant.id)}
      >
        <Text style={styles.visitButtonText}>Visit Store</Text>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={moderateScale(14)}
          color={colors.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: `${colors.muted}40`,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: moderateScale(spacing[4]),
    marginTop: verticalScale(spacing[6]),
    gap: verticalScale(spacing[4]),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[3]),
  },
  logoContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.background,
    ...shadows.sm,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  logoPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallback: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.lg),
    color: colors.primaryForeground,
  },
  info: {
    flex: 1,
    gap: verticalScale(spacing[1]),
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
  },
  storeName: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.base),
    color: colors.foreground,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(2),
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: horizontalScale(spacing[1.5]),
    paddingVertical: verticalScale(1),
    borderRadius: radii.full,
  },
  verifiedText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(10),
    color: colors.primary,
  },
  description: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
    lineHeight: moderateScale(fontSizes.xs * 1.4),
  },
  visitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: horizontalScale(spacing[2]),
    paddingVertical: verticalScale(spacing[3]),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
  },
  visitButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.primary,
  },
});
