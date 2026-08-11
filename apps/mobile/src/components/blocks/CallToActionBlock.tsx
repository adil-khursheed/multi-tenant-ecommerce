import { StyleSheet, View } from "react-native";

import { RichText } from "@/components/rich-text/RichText";
import { horizontalScale, verticalScale } from "@/constants/responsive";
import { colors, radii, spacing } from "@/constants/theme";

import { LinkButton } from "./LinkButton";
import type { BlockLink } from "./types";

type CallToActionBlockProps = {
  richText: unknown;
  links: BlockLink[];
};

export function CallToActionBlock({ richText, links }: CallToActionBlockProps) {
  if (!richText && !links?.length) return null;

  return (
    <View style={styles.container}>
      {richText != null && <RichText data={richText as never} />}
      {links?.length > 0 && (
        <View style={styles.links}>
          {links.map((link, i) => (
            <LinkButton
              key={i}
              label={link.label}
              href={link.href}
              appearance={link.appearance === "outline" ? "outline" : "default"}
              size="lg"
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: horizontalScale(spacing[5]),
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(spacing[3]),
    marginTop: verticalScale(spacing[5]),
  },
});
