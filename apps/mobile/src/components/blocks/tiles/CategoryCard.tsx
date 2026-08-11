import { Pressable, StyleSheet, Text, View } from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { horizontalScale, moderateScale, verticalScale } from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { getImageUrl, type MediaSource } from "@/utils/media";

type CategoryCardProps = {
  slug: string;
  name?: string | null;
  image: MediaSource;
  height?: number;
  onPress?: () => void;
};

export function CategoryCard({ slug, name, image, height, onPress }: CategoryCardProps) {
  const router = useRouter();
  const imageUrl = getImageUrl(image);

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.push("/(tabs)/shop" as never);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { height }, pressed && styles.pressed]}
      onPress={handlePress}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.gradient} />
      <View style={styles.labelWrapper}>
        <Text style={styles.label}>{name ?? slug}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: colors.muted,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  labelWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: horizontalScale(spacing[4]),
  },
  label: {
    fontFamily: fonts.sans.semiBold,
    fontSize: moderateScale(fontSizes.base),
    textTransform: "capitalize",
    color: colors.white,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pressed: {
    opacity: 0.85,
  },
});
