import { ScrollView, StyleSheet } from "react-native";

import { AddressesSection } from "@/components/profile";
import { horizontalScale, verticalScale } from "@/constants/responsive";
import { spacing } from "@/constants/theme";

export default function AddressesTab() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AddressesSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingTop: verticalScale(spacing[4]),
    paddingBottom: verticalScale(spacing[10]),
  },
});
