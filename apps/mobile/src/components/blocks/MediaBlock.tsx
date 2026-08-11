import { StyleSheet, View } from "react-native";

import { Image } from "expo-image";

import { RichText } from "@/components/rich-text/RichText";
import { verticalScale } from "@/constants/responsive";
import { colors, radii, spacing } from "@/constants/theme";
import { getImageUrl, type MediaSource } from "@/utils/media";

type MediaBlockProps = {
  media: MediaSource;
  caption: unknown;
};

export function MediaBlock({ media, caption }: MediaBlockProps) {
  const imageUrl = getImageUrl(media);
  if (!imageUrl) return null;

  return (
    <View>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      {caption != null && (
        <View style={styles.caption}>
          <RichText data={caption as never} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.muted,
  },
  caption: {
    marginTop: verticalScale(spacing[4]),
  },
});
