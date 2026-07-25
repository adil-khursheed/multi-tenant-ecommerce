import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import {
  CheckmarkCircle02Icon,
  CreditCardIcon,
  PackageIcon,
  TruckIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

import { useCheckout } from "@/providers/Checkout";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { horizontalScale, verticalScale, moderateScale } from "@/constants/responsive";

export default function CheckoutSuccess() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { completedOrderId } = useCheckout();

  return (
    <View style={[styles.container, { paddingTop: top + verticalScale(spacing[8]) }]}>
      <View style={styles.content}>
        <Animated.View
          entering={FadeIn.delay(100).duration(500)}
          style={styles.iconContainer}
        >
          <View style={styles.iconCircle}>
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={48}
              color={colors.white}
              strokeWidth={1.5}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.title}>Thank You for{"\n"}Your Order</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.orderId}>
            Order ID: <Text style={styles.orderIdValue}>{completedOrderId}</Text>
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          style={styles.timeline}
        >
          <View style={styles.timelineItem}>
            <View style={[styles.timelineIcon, styles.timelineIconActive]}>
              <HugeiconsIcon
                icon={CreditCardIcon}
                size={20}
                color={colors.foreground}
                strokeWidth={1.5}
              />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitleActive}>Payment Confirmed</Text>
              <Text style={styles.timelineDesc}>
                Your payment has been successfully processed
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <HugeiconsIcon
                icon={PackageIcon}
                size={20}
                color={colors.mutedForeground}
                strokeWidth={1.5}
              />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Order Processing</Text>
              <Text style={styles.timelineDesc}>We are preparing your order</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <HugeiconsIcon
                icon={TruckIcon}
                size={20}
                color={colors.mutedForeground}
                strokeWidth={1.5}
              />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Delivery expected</Text>
              <Text style={styles.timelineDesc}>
                Usually within 3-5 business days
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(700).duration(400)}
          style={styles.actions}
        >
          <Text
            style={styles.viewOrderButton}
            onPress={() => router.replace("/(tabs)")}
          >
            Continue Shopping
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: horizontalScale(spacing[6]),
  },
  iconContainer: {
    marginBottom: verticalScale(spacing[6]),
  },
  iconCircle: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: radii.full,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes["3xl"]),
    color: colors.foreground,
    textAlign: "center",
    marginBottom: verticalScale(spacing[3]),
    lineHeight: moderateScale(fontSizes["3xl"] * 1.2),
  },
  orderId: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
    marginBottom: verticalScale(spacing[6]),
  },
  orderIdValue: {
    fontFamily: fonts.sans.medium,
    color: colors.foreground,
    letterSpacing: 1,
  },
  timeline: {
    width: "100%",
    marginBottom: verticalScale(spacing[6]),
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: horizontalScale(spacing[3]),
  },
  timelineIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineIconActive: {
    backgroundColor: `${colors.foreground}15`,
  },
  timelineContent: {
    flex: 1,
    paddingVertical: verticalScale(spacing[2]),
  },
  timelineTitleActive: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes.base),
    color: colors.foreground,
    marginBottom: 2,
  },
  timelineTitle: {
    fontFamily: fonts.serif.regular,
    fontSize: moderateScale(fontSizes.base),
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  timelineDesc: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.xs),
    color: colors.mutedForeground,
  },
  timelineLine: {
    width: 1,
    height: verticalScale(spacing[3]),
    backgroundColor: colors.border,
    marginLeft: moderateScale(19),
    marginVertical: verticalScale(spacing[1]),
  },
  actions: {
    width: "100%",
    gap: verticalScale(spacing[3]),
  },
  viewOrderButton: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.white,
    backgroundColor: colors.foreground,
    textAlign: "center",
    paddingVertical: verticalScale(spacing[3]),
    textTransform: "uppercase",
    letterSpacing: 0.5,
    overflow: "hidden",
  },
});
