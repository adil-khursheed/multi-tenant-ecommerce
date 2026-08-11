import { StyleSheet, View } from "react-native";

import { RichText } from "@/components/rich-text/RichText";
import { horizontalScale, verticalScale } from "@/constants/responsive";
import { colors, radii, spacing } from "@/constants/theme";

type BannerBlockProps = {
  style: string;
  content: unknown;
};

function getPalette(style: string): { borderColor: string; backgroundColor: string } {
  switch (style) {
    case "error":
      return { borderColor: colors.error, backgroundColor: "rgba(196,42,42,0.1)" };
    case "success":
      return { borderColor: colors.success, backgroundColor: "rgba(0,137,74,0.1)" };
    case "warning":
      return { borderColor: colors.warning, backgroundColor: "rgba(217,161,80,0.12)" };
    case "info":
    default:
      return { borderColor: colors.border, backgroundColor: colors.card };
  }
}

export function BannerBlock({ style, content }: BannerBlockProps) {
  if (!content) return null;

  const palette = getPalette(style);

  return (
    <View
      style={[
        styles.container,
        { borderColor: palette.borderColor, backgroundColor: palette.backgroundColor },
      ]}
    >
      <RichText data={content as never} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: horizontalScale(spacing[6]),
    paddingVertical: verticalScale(spacing[3]),
  },
});
