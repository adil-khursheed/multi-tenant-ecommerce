import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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

const CM_TO_INCHES = 0.3937;

type SizeGuideRow = {
  id?: string | number;
  sizeLabel?: string | null;
  measurements?: { key: string; label: string; value: number }[];
  equivalentSizes?: {
    us?: string | null;
    uk?: string | null;
    eu?: string | null;
  };
};

type SizeGuide = {
  rows?: SizeGuideRow[];
  unit?: string | null;
  fitNote?: string | null;
  sizes?: {
    label?: string | null;
    chest?: number | null;
    length?: number | null;
    shoulder?: string | null;
    sleeve?: string | null;
  }[];
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

function convertValue(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return value;
  if (toUnit === "inches") return Math.round(value * CM_TO_INCHES * 10) / 10;
  return Math.round((value / CM_TO_INCHES) * 10) / 10;
}

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

          <View style={styles.singleMetaGrid}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Country of Origin</Text>
              <Text style={styles.metaValue}>
                {countryOfOrigin || "Not specified"}
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

      {sizeGuide && <SizeGuideSection sizeGuide={sizeGuide} />}

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

function SizeGuideSection({ sizeGuide }: { sizeGuide: SizeGuide }) {
  const hasRows = sizeGuide.rows && sizeGuide.rows.length > 0;
  const hasLegacy = sizeGuide.sizes && sizeGuide.sizes.length > 0;

  if (!hasRows && !hasLegacy) return null;

  const defaultUnit = sizeGuide.unit === "inches" ? "inches" : "cm";

  return (
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
        {hasRows ? (
          <SizeGuideTable rows={sizeGuide.rows!} defaultUnit={defaultUnit} />
        ) : (
          <LegacySizeGuide sizes={sizeGuide.sizes!} unit={defaultUnit} />
        )}
        {(sizeGuide.fitNote || sizeGuide.fitNotes) && (
          <Text style={styles.fitNotes}>
            {sizeGuide.fitNote || sizeGuide.fitNotes}
          </Text>
        )}
      </View>
    </AccordionGroup>
  );
}

function SizeGuideTable({
  rows,
  defaultUnit,
}: {
  rows: SizeGuideRow[];
  defaultUnit: string;
}) {
  const [displayUnit, setDisplayUnit] = useState<"cm" | "inches">(
    defaultUnit as "cm" | "inches",
  );

  const measurementKeys = useMemo(() => {
    if (!rows.length) return [];
    const firstRow = rows[0];
    if (!firstRow?.measurements?.length) return [];
    return firstRow.measurements.map((m) => ({ key: m.key, label: m.label }));
  }, [rows]);

  const hasEquivalents = useMemo(() => {
    return rows.some(
      (row) =>
        row.equivalentSizes?.us ||
        row.equivalentSizes?.uk ||
        row.equivalentSizes?.eu,
    );
  }, [rows]);

  const unitLabel = displayUnit === "cm" ? "cm" : "in";

  return (
    <View>
      <View style={styles.unitToggle}>
        <Text style={styles.unitText}>
          Measurements in{" "}
          <Text style={styles.unitBold}>{unitLabel}</Text>
        </Text>
        <Pressable
          style={styles.unitButton}
          onPress={() =>
            setDisplayUnit((prev) => (prev === "cm" ? "inches" : "cm"))
          }
        >
          <Text style={styles.unitButtonText}>
            Switch to {displayUnit === "cm" ? "inches" : "cm"}
          </Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableCellSize]}>
              Size
            </Text>
            {measurementKeys.map((mk) => (
              <Text key={mk.key} style={[styles.tableHeaderText, styles.tableCellValue]}>
                {mk.label}
              </Text>
            ))}
            {hasEquivalents && (
              <>
                <Text style={[styles.tableHeaderText, styles.tableCellEquiv]}>US</Text>
                <Text style={[styles.tableHeaderText, styles.tableCellEquiv]}>UK</Text>
                <Text style={[styles.tableHeaderText, styles.tableCellEquiv]}>EU</Text>
              </>
            )}
          </View>

          {/* Rows */}
          {rows.map((row, i) => (
            <View
              key={row.id ?? i}
              style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}
            >
              <Text style={[styles.tableCellText, styles.tableCellSize, styles.tableCellBold]}>
                {row.sizeLabel}
              </Text>
              {measurementKeys.map((mk) => {
                const measurement = row.measurements?.find(
                  (m) => m.key === mk.key,
                );
                const rawValue = measurement?.value ?? 0;
                const displayValue = convertValue(
                  rawValue,
                  defaultUnit,
                  displayUnit,
                );
                return (
                  <Text key={mk.key} style={[styles.tableCellText, styles.tableCellValue]}>
                    {displayValue} {unitLabel}
                  </Text>
                );
              })}
              {hasEquivalents && (
                <>
                  <Text style={[styles.tableCellText, styles.tableCellEquiv]}>
                    {row.equivalentSizes?.us || "\u2014"}
                  </Text>
                  <Text style={[styles.tableCellText, styles.tableCellEquiv]}>
                    {row.equivalentSizes?.uk || "\u2014"}
                  </Text>
                  <Text style={[styles.tableCellText, styles.tableCellEquiv]}>
                    {row.equivalentSizes?.eu || "\u2014"}
                  </Text>
                </>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function LegacySizeGuide({
  sizes,
  unit,
}: {
  sizes: NonNullable<SizeGuide["sizes"]>;
  unit: string;
}) {
  return (
    <View>
      {sizes.map((size, i) => (
        <View key={i} style={styles.sizeRow}>
          <Text style={styles.sizeLabel}>{size.label}</Text>
          <Text style={styles.sizeValue}>
            {size.chest ? `Chest: ${size.chest}${unit}` : ""}
            {size.length ? ` | L: ${size.length}${unit}` : ""}
          </Text>
        </View>
      ))}
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
  singleMetaGrid: {
    marginTop: verticalScale(spacing[2]),
  },
  metaCard: {
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
  unitToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(spacing[3]),
  },
  unitText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  unitBold: {
    fontFamily: fonts.sans.medium,
    color: colors.foreground,
  },
  unitButton: {
    paddingHorizontal: horizontalScale(spacing[2]),
    paddingVertical: verticalScale(2),
  },
  unitButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.primary,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(spacing[2]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tableHeaderText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(spacing[2]),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tableRowEven: {
    backgroundColor: `${colors.muted}30`,
  },
  tableCellText: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.foreground,
  },
  tableCellBold: {
    fontFamily: fonts.sans.medium,
  },
  tableCellSize: {
    width: horizontalScale(60),
  },
  tableCellValue: {
    width: horizontalScale(70),
  },
  tableCellEquiv: {
    width: horizontalScale(45),
    textAlign: "center",
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
