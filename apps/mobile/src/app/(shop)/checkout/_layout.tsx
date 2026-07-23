import { Stack } from "expo-router";

import { CheckoutProvider } from "@/providers/Checkout";

export default function CheckoutLayout() {
  return (
    <CheckoutProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="contact" />
        <Stack.Screen name="address" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="review" />
        <Stack.Screen
          name="success"
          options={{ gestureEnabled: false, animation: "fade" }}
        />
      </Stack>
    </CheckoutProvider>
  );
}
