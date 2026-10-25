import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import Carousel, {
  type ICarouselInstance,
} from "react-native-reanimated-carousel";

import {
  ArrowRight01Icon,
  PauseIcon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import {
  horizontalScale,
  moderateScale,
  width as SCREEN_WIDTH,
  verticalScale,
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
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const carouselRef = useRef<ICarouselInstance>(null);
  const reducedMotion = useReducedMotion();
  const router = useRouter();

  const handleSnap = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const validSlides = slides.filter((s) => s.mediaUrl !== null);

  if (validSlides.length === 0) return null;

  const slideHeight = SCREEN_WIDTH * (5 / 3);
  const autoPlay = !reducedMotion && !autoplayPaused;

  return (
    <View style={styles.container}>
      <View style={[styles.carouselContainer, { height: slideHeight }]}>
        <Carousel
          ref={carouselRef}
          data={validSlides}
          width={SCREEN_WIDTH}
          height={slideHeight}
          loop
          autoPlay={autoPlay}
          autoPlayInterval={AUTOPLAY_INTERVAL}
          pagingEnabled
          snapEnabled
          onSnapToItem={handleSnap}
          renderItem={({ item, index }) => {
            const imageUrl = `${process.env.EXPO_PUBLIC_API_URL}${item.mediaUrl}`;

            return (
              <Pressable
                style={styles.slide}
                accessibilityRole={item.linkHref ? "button" : "image"}
                accessibilityLabel={
                  item.heading ?? `Featured collection ${index + 1}`
                }
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
                {imageUrl && (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.slideImage}
                    contentFit="cover"
                    transition={300}
                  />
                )}

                <LinearGradient
                  pointerEvents="none"
                  colors={[
                    "transparent",
                    "rgba(0,0,0,0.18)",
                    "rgba(0,0,0,0.82)",
                  ]}
                  locations={[0.3, 0.62, 1]}
                  style={StyleSheet.absoluteFill}
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
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={moderateScale(12)}
                        strokeWidth={2}
                        color={colors.foreground}
                      />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          }}
        />

        <View pointerEvents="box-none" style={styles.controls}>
          <View style={styles.pagination}>
            {validSlides.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.controlsRight}>
            <Text style={styles.counter}>
              {String(currentIndex + 1).padStart(2, "0")}
              <Text style={styles.counterMuted}>
                {" / "}
                {String(validSlides.length).padStart(2, "0")}
              </Text>
            </Text>

            {!reducedMotion && validSlides.length > 1 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  autoPlay ? "Pause slideshow" : "Play slideshow"
                }
                onPress={() => setAutoplayPaused((paused) => !paused)}
                hitSlop={8}
                style={styles.playButton}
              >
                <HugeiconsIcon
                  icon={autoPlay ? PauseIcon : PlayIcon}
                  size={moderateScale(12)}
                  strokeWidth={2}
                  color={colors.white}
                />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
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
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[1.5]),
    backgroundColor: colors.white,
    paddingHorizontal: horizontalScale(spacing[4]),
    paddingVertical: verticalScale(spacing[2]),
    borderRadius: radii.sm,
  },
  ctaText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(11),
    color: colors.foreground,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  controls: {
    position: "absolute",
    bottom: verticalScale(spacing[4]),
    left: horizontalScale(spacing[5]),
    right: horizontalScale(spacing[5]),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[1.5]),
  },
  controlsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(spacing[3]),
  },
  counter: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(10),
    letterSpacing: 1.6,
    color: "rgba(255,255,255,0.85)",
  },
  counterMuted: {
    color: "rgba(255,255,255,0.45)",
  },
  playButton: {
    alignItems: "center",
    justifyContent: "center",
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(0,0,0,0.22)",
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
