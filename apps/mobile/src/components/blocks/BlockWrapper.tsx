import { StyleSheet, View } from "react-native";

import { RichText } from "@/components/rich-text/RichText";
import { horizontalScale, verticalScale } from "@/constants/responsive";
import { spacing } from "@/constants/theme";

type BlockWrapperProps = {
  heading?: unknown;
  children: React.ReactNode;
  style?: object;
};

export function BlockWrapper({ heading, children, style }: BlockWrapperProps) {
  console.log(JSON.stringify(heading, null, 2));

  return (
    <View style={[styles.container, style]}>
      {heading != null && (
        <View style={styles.heading}>
          <RichText data={heading as never} />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: horizontalScale(spacing[5]),
    paddingVertical: verticalScale(spacing[7]),
  },
  heading: {
    marginBottom: verticalScale(spacing[5]),
  },
});
