import { Stack } from "expo-router";

import { colors, fonts, fontSizes } from "@/constants/theme";
import { moderateScale } from "@/constants/responsive";

export default function ShopLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontFamily: fonts.sans.medium,
          fontSize: moderateScale(fontSizes.base),
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="[slug]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </Stack>
  );
}
