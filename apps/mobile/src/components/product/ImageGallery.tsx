import { useCallback, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Carousel, {
  type ICarouselInstance,
} from "react-native-reanimated-carousel";

import { Image } from "expo-image";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, spacing } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type GalleryItem = {
  image: string | { url: string; id?: string | number; [k: string]: unknown };
  variantOption?: string | { id: string | number } | null;
  id?: string | null;
};

type ImageGalleryProps = {
  gallery: GalleryItem[];
  isBestseller?: boolean | null;
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  onImagePress?: (index: number) => void;
};

function getImageUrl(image: GalleryItem["image"]): string | null {
  if (!image) return null;
  if (typeof image === "string")
    return `${process.env.EXPO_PUBLIC_API_URL}${image}`;
  if (
    typeof image === "object" &&
    "url" in image &&
    typeof image.url === "string"
  ) {
    return `${process.env.EXPO_PUBLIC_API_URL}${image.url}`;
  }
  return null;
}

export function ImageGallery({
  gallery,
  isBestseller,
  activeIndex: controlledIndex,
  onIndexChange,
  onImagePress,
}: ImageGalleryProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);

  const currentIndex = controlledIndex ?? internalIndex;

  const handleSnap = useCallback(
    (index: number) => {
      setInternalIndex(index);
      onIndexChange?.(index);
    },
    [onIndexChange],
  );

  const validItems = gallery.filter((item) => getImageUrl(item.image) !== null);

  if (validItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyPlaceholder} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.carouselContainer}>
        <Carousel
          ref={carouselRef}
          data={validItems}
          width={SCREEN_WIDTH}
          height={SCREEN_WIDTH * (4 / 3)}
          loop={false}
          pagingEnabled
          snapEnabled
          defaultIndex={currentIndex}
          onSnapToItem={handleSnap}
          renderItem={({ item, index }) => {
            const url = getImageUrl(item.image);
            return (
              <Pressable
                style={styles.slide}
                onPress={() => onImagePress?.(index)}
              >
                {url ? (
                  <Image
                    source={{ uri: url }}
                    style={styles.slideImage}
                    contentFit="contain"
                    transition={300}
                  />
                ) : (
                  <View style={[styles.slideImage, styles.slidePlaceholder]} />
                )}
              </Pressable>
            );
          }}
        />

        {isBestseller && (
          <View style={styles.ribbon}>
            <Text style={styles.ribbonText}>BESTSELLER</Text>
          </View>
        )}
      </View>

      {validItems.length > 1 && (
        <View style={styles.pagination}>
          {validItems.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}

      <Text style={styles.photoCount}>{validItems.length} photos</Text>
    </View>
  );
}

export { getImageUrl };

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  emptyContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: colors.muted,
  },
  emptyPlaceholder: {
    flex: 1,
  },
  carouselContainer: {
    position: "relative",
  },
  slide: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.muted,
  },
  slideImage: {
    width: "100%",
    height: "100%",
  },
  slidePlaceholder: {
    backgroundColor: colors.muted,
  },
  ribbon: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: horizontalScale(spacing[2]),
    paddingVertical: verticalScale(spacing[1]),
    zIndex: 10,
  },
  ribbonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(9),
    color: colors.primaryForeground,
    textTransform: "uppercase",
    letterSpacing: 0.1,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: horizontalScale(spacing[1.5]),
    paddingVertical: verticalScale(spacing[3]),
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  photoCount: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(10),
    color: colors.mutedForeground,
    textAlign: "center",
  },
});
