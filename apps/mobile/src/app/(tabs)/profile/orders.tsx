import { ScrollView, StyleSheet } from "react-native";

import { OrdersSection } from "@/components/profile";
import { horizontalScale, verticalScale } from "@/constants/responsive";
import { spacing } from "@/constants/theme";

export default function OrdersTab() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <OrdersSection />
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
