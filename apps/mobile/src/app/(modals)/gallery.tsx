import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { ZoomableImage } from "@/components/product/ZoomableImage";
import { fonts } from "@/constants/theme";
import { moderateScale, horizontalScale, verticalScale } from "@/constants/responsive";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function GalleryScreen() {
  const { images, index: initialIndex } = useLocalSearchParams<{
    images: string;
    index: string;
  }>();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex ? parseInt(initialIndex, 10) : 0,
  );

  const imageUrls: string[] = useMemo(() => {
    try {
      if (!images) return [];
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      return [];
    } catch {
      return [];
    }
  }, [images]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleSwipeDown = useCallback(() => {
    router.back();
  }, [router]);

  if (imageUrls.length === 0) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No images available</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Background */}
        <View style={styles.background} />

        {/* Close button */}
        <View style={[styles.topBar, { top: top + 12 }]}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={moderateScale(22)}
              color="#ffffff"
            />
          </Pressable>

          {imageUrls.length > 1 && (
            <Text style={styles.counter}>
              {currentIndex + 1} / {imageUrls.length}
            </Text>
          )}
        </View>

        {/* Carousel */}
        <Carousel
          data={imageUrls}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          loop={false}
          pagingEnabled
          snapEnabled
          defaultIndex={initialIndex ? parseInt(initialIndex, 10) : 0}
          onSnapToItem={setCurrentIndex}
          renderItem={({ item }) => (
            <ZoomableImage uri={item} onSwipeDown={handleSwipeDown} />
          )}
        />

        {/* Pagination dots */}
        {imageUrls.length > 1 && (
          <View style={styles.pagination}>
            {imageUrls.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
  },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(16),
    zIndex: 100,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  counter: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(14),
    color: "#ffffff",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: 14,
    overflow: "hidden",
  },
  pagination: {
    position: "absolute",
    bottom: verticalScale(40),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: horizontalScale(6),
    zIndex: 100,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    backgroundColor: "#ffffff",
    width: 20,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(16),
    color: "rgba(255,255,255,0.6)",
  },
});
