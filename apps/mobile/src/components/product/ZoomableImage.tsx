import { Dimensions, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MAX_SCALE = 5;
const MIN_SCALE = 1;
const DOUBLE_TAP_SCALE = 2;
const SPRING_CONFIG = { damping: 20, stiffness: 300, mass: 1 };

type ZoomableImageProps = {
  uri: string;
  onSwipeDown?: () => void;
};

export function ZoomableImage({ uri, onSwipeDown }: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = () => {
    "worklet";
    scale.value = withSpring(1, SPRING_CONFIG);
    savedScale.value = 1;
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const handleDoubleTap = () => {
    "worklet";
    if (scale.value > 1) {
      resetZoom();
    } else {
      scale.value = withSpring(DOUBLE_TAP_SCALE, SPRING_CONFIG);
      savedScale.value = DOUBLE_TAP_SCALE;
    }
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE * 0.8, newScale));
    })
    .onEnd((e) => {
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE, SPRING_CONFIG);
        savedScale.value = MIN_SCALE;
      } else if (scale.value > MAX_SCALE) {
        scale.value = withSpring(MAX_SCALE, SPRING_CONFIG);
        savedScale.value = MAX_SCALE;
      } else {
        savedScale.value = scale.value;
      }
    });

  const pan = Gesture.Pan()
    .minPointers(1)
    .onUpdate((e) => {
      if (scale.value <= 1) {
        // When not zoomed, track vertical translation for dismiss
        translateY.value = e.translationY;
        return;
      }
      // When zoomed, allow panning within bounds
      const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
      const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;
      translateX.value = Math.min(
        maxTranslateX,
        Math.max(-maxTranslateX, savedTranslateX.value + e.translationX),
      );
      translateY.value = Math.min(
        maxTranslateY,
        Math.max(-maxTranslateY, savedTranslateY.value + e.translationY),
      );
    })
    .onEnd((e) => {
      if (scale.value <= 1) {
        // Swipe-to-dismiss: if dragged down far enough and fast enough
        if (e.translationY > 120 && Math.abs(e.velocityY) > 500) {
          if (onSwipeDown) {
            runOnJS(onSwipeDown)();
          }
        } else {
          translateY.value = withSpring(0, SPRING_CONFIG);
        }
        return;
      }

      // Clamp pan to image bounds
      const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
      const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

      const clampedX = Math.min(
        maxTranslateX,
        Math.max(-maxTranslateX, translateX.value),
      );
      const clampedY = Math.min(
        maxTranslateY,
        Math.max(-maxTranslateY, translateY.value),
      );

      translateX.value = withSpring(clampedX, SPRING_CONFIG);
      translateY.value = withSpring(clampedY, SPRING_CONFIG);
      savedTranslateX.value = clampedX;
      savedTranslateY.value = clampedY;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd(() => {
      handleDoubleTap();
    });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={styles.container}>
        <Animated.Image
          source={{ uri }}
          style={[styles.image, animatedStyle]}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (4 / 3),
  },
});
