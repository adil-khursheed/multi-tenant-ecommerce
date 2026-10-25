import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
} from "react-native";

import { ArrowUpRight } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, spacing } from "@/constants/theme";

type EditorialTileProps = {
  name: string;
  imageUrl: string | null;
  onPress: () => void;
  accessibilityLabel?: string;
  height?: number;
  width?: DimensionValue;
  aspectRatio?: number;
};

export function EditorialTile({
  name,
  imageUrl,
  onPress,
  accessibilityLabel,
  height,
  width = "100%",
  aspectRatio = 3 / 4,
}: EditorialTileProps) {
  const hasImage = Boolean(imageUrl);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          width,
          height,
          aspectRatio: height ? undefined : aspectRatio,
        },
        pressed && styles.pressed,
      ]}
    >
      {hasImage ? (
        <Image
          source={{ uri: imageUrl! }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.watermark}
          numberOfLines={1}
        >
          {name.charAt(0).toUpperCase()}
        </Text>
      )}

      <LinearGradient
        pointerEvents="none"
        colors={
          hasImage
            ? ["transparent", "rgba(0,0,0,0.84)"]
            : ["transparent", colors.secondary]
        }
        locations={[0.3, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.labelRow}>
        <Text
          style={[styles.label, !hasImage && styles.labelOnPaper]}
          numberOfLines={2}
        >
          {name}
        </Text>
        <View
          style={[
            styles.arrow,
            hasImage ? styles.arrowOnImage : styles.arrowOnPaper,
          ]}
        >
          <HugeiconsIcon
            icon={ArrowUpRight}
            size={moderateScale(14)}
            strokeWidth={2}
            color={hasImage ? colors.white : colors.primary}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: "relative",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.border}B3`,
    backgroundColor: colors.secondary,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.88,
  },
  watermark: {
    position: "absolute",
    top: verticalScale(-spacing[6]),
    right: horizontalScale(spacing[1]),
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(128),
    lineHeight: moderateScale(128),
    color: `${colors.primary}1A`,
  },
  labelRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: horizontalScale(spacing[3]),
    padding: horizontalScale(spacing[4]),
  },
  label: {
    flexShrink: 1,
    maxWidth: "78%",
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(24),
    lineHeight: moderateScale(24 * 1.02),
    letterSpacing: -0.2,
    color: colors.white,
  },
  labelOnPaper: {
    color: colors.foreground,
  },
  arrow: {
    alignItems: "center",
    justifyContent: "center",
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 1,
  },
  arrowOnImage: {
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  arrowOnPaper: {
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
});
