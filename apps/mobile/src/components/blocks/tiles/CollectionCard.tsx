import { type DimensionValue, Pressable, StyleSheet, Text, View } from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { horizontalScale, moderateScale } from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { getImageUrl, type MediaSource } from "@/utils/media";

type CollectionCardProps = {
  slug: string;
  name?: string | null;
  coverImage: MediaSource;
  width?: DimensionValue;
  onPress?: () => void;
};

export function CollectionCard({ slug, name, coverImage, width, onPress }: CollectionCardProps) {
  const router = useRouter();
  const imageUrl = getImageUrl(coverImage);

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.push("/(tabs)/shop" as never);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed && styles.pressed,
      ]}
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
    aspectRatio: 3 / 4,
    borderRadius: radii.xl,
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
    height: "50%",
    backgroundColor: "rgba(0,0,0,0.4)",
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
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.white,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pressed: {
    opacity: 0.85,
  },
});
