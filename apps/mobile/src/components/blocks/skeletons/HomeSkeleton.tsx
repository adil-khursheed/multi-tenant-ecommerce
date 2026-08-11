import { StyleSheet, View } from "react-native";

import {
  horizontalScale,
  verticalScale,
  width as SCREEN_WIDTH,
} from "@/constants/responsive";
import { spacing } from "@/constants/theme";

import { ProductGridSkeleton, BannerSkeleton, CarouselSkeleton, HeadingSkeleton } from "./BlockSkeletons";
import { Skeleton } from "./Skeleton";

/**
 * Structural skeleton for the home screen. Mirrors the typical layout:
 * full-bleed hero, then a sequence of content blocks (banner, carousel,
 * heading + product grid).
 */
export function HomeSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton
        width={SCREEN_WIDTH}
        height={SCREEN_WIDTH * (4 / 3)}
        borderRadius={0}
      />

      <View style={styles.section}>
        <BannerSkeleton />
      </View>

      <View style={styles.section}>
        <HeadingSkeleton />
        <CarouselSkeleton />
      </View>

      <View style={styles.section}>
        <HeadingSkeleton width="30%" />
        <ProductGridSkeleton count={4} />
      </View>

      <View style={styles.section}>
        <HeadingSkeleton width="50%" />
        <ProductGridSkeleton count={2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  section: {
    width: "100%",
    paddingHorizontal: horizontalScale(spacing[5]),
    paddingVertical: verticalScale(spacing[7]),
  },
});
