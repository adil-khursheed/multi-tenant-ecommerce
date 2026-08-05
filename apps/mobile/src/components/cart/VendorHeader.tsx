import { StyleSheet, Text, View } from "react-native";

import { Image } from "expo-image";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";

type Props = {
  storeName: string;
  storeLogoUrl: string | null;
  itemCount: number;
};

export function VendorHeader({ storeName, storeLogoUrl, itemCount }: Props) {
  const initial = storeName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        {storeLogoUrl ? (
          <Image
            source={{ uri: storeLogoUrl }}
            style={styles.avatarImage}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <Text style={styles.avatarFallback}>{initial}</Text>
        )}
      </View>

      <Text style={styles.storeName} numberOfLines={1}>
        {storeName}
        <Text style={styles.itemCount}>
          {"  —  "}
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[2]),
    backgroundColor: colors.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[2.5]),
  },
  avatar: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: radii.full,
    overflow: "hidden",
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    fontFamily: fonts.sans.bold,
    fontSize: moderateScale(10),
    color: colors.mutedForeground,
  },
  storeName: {
    flexShrink: 1,
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  itemCount: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
});
