import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

import { RenderHero } from "@/components/hero/RenderHero";
import { colors, typography } from "@/constants/theme";
import { useTRPC } from "@/utils/api";

export default function Home() {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.pages.getHero.queryOptions({ slug: "home" }),
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : data ? (
        <RenderHero hero={data as any} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={typography.heading2}>Home</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
});
