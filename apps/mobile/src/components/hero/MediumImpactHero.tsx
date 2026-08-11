import { Pressable, StyleSheet, Text, View } from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { RichText } from "@/components/rich-text/RichText";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";

type Link = {
  href: string;
  label: string;
  appearance: string;
};

export type MediumImpactHeroProps = {
  richText: unknown;
  mediaUrl: string | null;
  links: Link[];
  mediaCaption: unknown;
};

export function MediumImpactHero({
  richText,
  mediaUrl,
  links,
  mediaCaption,
}: MediumImpactHeroProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Text content */}
      <View style={styles.content}>
        {richText != null && <RichText data={richText as any} />}

        {links.length > 0 && (
          <View style={styles.links}>
            {links.map((link, i) => (
              <Pressable
                key={i}
                style={styles.linkButton}
                onPress={() => {
                  if (!link.href.startsWith("http")) {
                    router.push(link.href as any);
                  }
                }}
              >
                <Text style={styles.linkText}>{link.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Media image */}
      {mediaUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${mediaUrl}` }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>
      )}

      {/* Media caption */}
      {mediaCaption != null && (
        <View style={styles.captionContainer}>
          <RichText data={mediaCaption as any} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  content: {
    paddingHorizontal: horizontalScale(spacing[5]),
    paddingVertical: verticalScale(spacing[5]),
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(spacing[3]),
    marginTop: verticalScale(spacing[4]),
  },
  linkButton: {
    paddingHorizontal: horizontalScale(spacing[5]),
    paddingVertical: verticalScale(spacing[2.5]),
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  linkText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: colors.muted,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  captionContainer: {
    paddingHorizontal: horizontalScale(spacing[5]),
    paddingVertical: verticalScale(spacing[3]),
  },
});
