import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { HomeSkeleton } from "@/components/blocks/skeletons/HomeSkeleton";
import { RenderHero } from "@/components/hero/RenderHero";
import { colors, typography } from "@/constants/theme";
import { useTRPC } from "@/utils/api";

export default function Home() {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.pages.getPageBySlug.queryOptions({ slug: "home" }),
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      {isLoading ? (
        <HomeSkeleton />
      ) : data ? (
        <>
          <RenderHero hero={data.hero as never} />
          <RenderBlocks blocks={data.layout as never} />
        </>
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
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
});
