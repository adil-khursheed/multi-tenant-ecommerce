import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Carousel, {
  type ICarouselInstance,
} from "react-native-reanimated-carousel";

import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
  width as SCREEN_WIDTH,
} from "@/constants/responsive";
import { colors, fonts, radii, spacing } from "@/constants/theme";

export type HeroSlide = {
  id?: string | null;
  mediaUrl: string | null;
  heading: string | null;
  subheading: string | null;
  linkHref: string | null;
  linkLabel: string | null;
};

type HeroSliderProps = {
  slides: HeroSlide[];
};

const AUTOPLAY_INTERVAL = 4000;

export function HeroSlider({ slides }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const router = useRouter();

  const handleSnap = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const validSlides = slides.filter((s) => s.mediaUrl !== null);

  if (validSlides.length === 0) return null;

  const slideHeight = SCREEN_WIDTH * (4 / 3);

  return (
    <View style={styles.container}>
      <View style={[styles.carouselContainer, { height: slideHeight }]}>
        <Carousel
          ref={carouselRef}
          data={validSlides}
          width={SCREEN_WIDTH}
          height={slideHeight}
          loop
          autoPlay
          autoPlayInterval={AUTOPLAY_INTERVAL}
          pagingEnabled
          snapEnabled
          onSnapToItem={handleSnap}
          renderItem={({ item }) => (
            <Pressable
              style={styles.slide}
              onPress={() => {
                if (item.linkHref) {
                  if (item.linkHref.startsWith("http")) {
                    // external link
                  } else {
                    router.push(item.linkHref as any);
                  }
                }
              }}
            >
              {item.mediaUrl && (
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={styles.slideImage}
                  contentFit="cover"
                  transition={300}
                />
              )}

              {/* Gradient overlay for text readability */}
              <LinearGradient
                colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.2)", "transparent"]}
                locations={[0, 0.4, 1]}
                style={styles.gradientOverlay}
              />

              {/* Text overlay — bottom-left */}
              <View style={styles.textOverlay}>
                {item.heading && (
                  <Text style={styles.heading}>{item.heading}</Text>
                )}
                {item.subheading && (
                  <Text style={styles.subheading}>{item.subheading}</Text>
                )}
                {item.linkLabel && (
                  <View style={styles.ctaBadge}>
                    <Text style={styles.ctaText}>{item.linkLabel}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          )}
        />

        {/* Pagination dots */}
        {validSlides.length > 1 && (
          <View style={styles.pagination}>
            {validSlides.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
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
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: horizontalScale(spacing[5]),
    paddingBottom: verticalScale(spacing[8]),
    paddingTop: verticalScale(spacing[16]),
  },
  heading: {
    fontFamily: fonts.serif.light,
    fontSize: moderateScale(26),
    fontWeight: "300",
    color: colors.white,
    lineHeight: moderateScale(30),
    letterSpacing: -0.3,
    marginBottom: verticalScale(spacing[1]),
  },
  subheading: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(13),
    color: "rgba(255,255,255,0.8)",
    marginBottom: verticalScale(spacing[3]),
  },
  ctaBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[1.5]),
    borderRadius: radii.sm,
  },
  ctaText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(11),
    color: colors.foreground,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  pagination: {
    position: "absolute",
    bottom: verticalScale(spacing[3]),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: horizontalScale(spacing[1.5]),
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 20,
  },
});
