import { StyleSheet, View } from "react-native";

import { RichText } from "@/components/rich-text/RichText";
import { horizontalScale, verticalScale } from "@/constants/responsive";
import { spacing } from "@/constants/theme";

export type LowImpactHeroProps = {
  richText: unknown;
};

export function LowImpactHero({ richText }: LowImpactHeroProps) {
  if (!richText) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <RichText data={richText as any} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  content: {
    paddingHorizontal: horizontalScale(spacing[5]),
    paddingVertical: verticalScale(spacing[6]),
    maxWidth: 640,
  },
});
