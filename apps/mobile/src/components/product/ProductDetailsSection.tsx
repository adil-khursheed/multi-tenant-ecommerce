import { StyleSheet, Text, View } from "react-native";

import {
  AlignLeftIcon,
  Shirt01Icon,
  RulerIcon,
  DeliveryTruck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { AccordionGroup } from "@/components/shop/AccordionGroup";
import { colors, fonts, fontSizes, spacing, radii } from "@/constants/theme";
import { moderateScale, horizontalScale, verticalScale } from "@/constants/responsive";

type SizeGuide = {
  sizes?: {
    label?: string | null;
    chest?: number | null;
    length?: number | null;
    shoulder?: string | null;
    sleeve?: string | null;
  }[];
  unit?: string | null;
  fitNotes?: string | null;
};

type Tenant = {
  shippingPolicy?: unknown | null;
  returnAndExchangePolicy?: unknown | null;
} | null;

type ProductDetailsSectionProps = {
  description?: string | null;
  countryOfOrigin?: string | null;
  careInstructions?: string | null;
  materials?: { name?: string | null }[] | null;
  sizeGuide?: SizeGuide | null;
  tenant?: Tenant;
};

export function ProductDetailsSection({
  description,
  countryOfOrigin,
  careInstructions,
  materials,
  sizeGuide,
  tenant,
}: ProductDetailsSectionProps) {
  return (
    <View style={styles.container}>
      <AccordionGroup
        title="Product Details"
        defaultOpen={true}
        icon={
          <HugeiconsIcon
            icon={AlignLeftIcon}
            size={moderateScale(16)}
            color={colors.mutedForeground}
          />
        }
      >
        <View style={styles.sectionContent}>
          {description ? (
            <Text style={styles.descriptionText}>{description}</Text>
          ) : (
            <Text style={styles.noDataText}>No description available.</Text>
          )}

          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Country of Origin</Text>
              <Text style={styles.metaValue}>
                {countryOfOrigin || "Not specified"}
              </Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Care</Text>
              <Text style={styles.metaValue}>
                {careInstructions || "Not specified"}
              </Text>
            </View>
          </View>
        </View>
      </AccordionGroup>

      <AccordionGroup
        title="Fabric & Care"
        defaultOpen={false}
        icon={
          <HugeiconsIcon
            icon={Shirt01Icon}
            size={moderateScale(16)}
            color={colors.mutedForeground}
          />
        }
      >
        <View style={styles.sectionContent}>
          {materials && materials.length > 0 ? (
            materials.map((m, i) => (
              <Text key={i} style={styles.listItem}>
                {"\u2022"} {m.name || "Material"}
              </Text>
            ))
          ) : (
            <Text style={styles.noDataText}>
              No material information available.
            </Text>
          )}

          <View style={styles.subSection}>
            <Text style={styles.subTitle}>Care Instructions</Text>
            <Text style={styles.descriptionText}>
              {careInstructions || "Not specified"}
            </Text>
          </View>
        </View>
      </AccordionGroup>

      {sizeGuide && sizeGuide.sizes && sizeGuide.sizes.length > 0 && (
        <AccordionGroup
          title="Size Guide"
          defaultOpen={false}
          icon={
            <HugeiconsIcon
              icon={RulerIcon}
              size={moderateScale(16)}
              color={colors.mutedForeground}
            />
          }
        >
          <View style={styles.sectionContent}>
            {sizeGuide.sizes.map((size, i) => (
              <View key={i} style={styles.sizeRow}>
                <Text style={styles.sizeLabel}>{size.label}</Text>
                <Text style={styles.sizeValue}>
                  {size.chest ? `Chest: ${size.chest}${sizeGuide.unit || "cm"}` : ""}
                  {size.length ? ` | L: ${size.length}${sizeGuide.unit || "cm"}` : ""}
                </Text>
              </View>
            ))}
            {sizeGuide.fitNotes && (
              <Text style={styles.fitNotes}>{sizeGuide.fitNotes}</Text>
            )}
          </View>
        </AccordionGroup>
      )}

      <AccordionGroup
        title="Delivery & Returns"
        defaultOpen={false}
        icon={
          <HugeiconsIcon
            icon={DeliveryTruck01Icon}
            size={moderateScale(16)}
            color={colors.mutedForeground}
          />
        }
      >
        <View style={styles.sectionContent}>
          <View style={styles.policySection}>
            <Text style={styles.subTitle}>Shipping Policy</Text>
            <Text style={styles.descriptionText}>
              {typeof tenant?.shippingPolicy === "string"
                ? tenant.shippingPolicy
                : "Shipping and delivery information will be provided by the seller."}
            </Text>
          </View>

          <View style={styles.policySection}>
            <Text style={styles.subTitle}>Return & Exchange Policy</Text>
            <Text style={styles.descriptionText}>
              {typeof tenant?.returnAndExchangePolicy === "string"
                ? tenant.returnAndExchangePolicy
                : "Returns are accepted within 30 days of purchase. Items must be in their original condition with tags attached."}
            </Text>
          </View>
        </View>
      </AccordionGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(spacing[6]),
  },
  sectionContent: {
    gap: verticalScale(spacing[3]),
  },
  descriptionText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
    lineHeight: moderateScale(fontSizes.sm * 1.6),
  },
  noDataText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  metaGrid: {
    flexDirection: "row",
    gap: horizontalScale(spacing[3]),
    marginTop: verticalScale(spacing[2]),
  },
  metaCard: {
    flex: 1,
    backgroundColor: `${colors.muted}80`,
    padding: moderateScale(spacing[3]),
    borderRadius: radii.sm,
  },
  metaLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(10),
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.08,
    marginBottom: verticalScale(spacing[1]),
  },
  metaValue: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  listItem: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
    lineHeight: moderateScale(fontSizes.sm * 1.5),
  },
  subSection: {
    marginTop: verticalScale(spacing[2]),
  },
  subTitle: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
    marginBottom: verticalScale(spacing[1]),
  },
  policySection: {
    gap: verticalScale(spacing[1]),
  },
  sizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(spacing[2]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sizeLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  sizeValue: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  fitNotes: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    fontStyle: "italic",
    marginTop: verticalScale(spacing[2]),
  },
});
