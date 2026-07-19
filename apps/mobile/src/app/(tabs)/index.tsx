import { Text, View, StyleSheet } from "react-native";

import { colors, typography } from "@/constants/theme";

export default function Home() {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={typography.heading2}>Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
