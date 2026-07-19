import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { TRPCReactProvider } from "../utils/api";
import { AuthProvider } from "../providers/Auth";
import { CartProvider } from "../providers/Cart";
import { CurrencyProvider } from "../providers/Currency";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "DMSans-Light": require("@/assets/fonts/DMSans-Light.ttf"),
    "DMSans-Regular": require("@/assets/fonts/DMSans-Regular.ttf"),
    "DMSans-Medium": require("@/assets/fonts/DMSans-Medium.ttf"),
    "DMSans-SemiBold": require("@/assets/fonts/DMSans-SemiBold.ttf"),
    "DMSans-Bold": require("@/assets/fonts/DMSans-Bold.ttf"),
    "CormorantGaramond-Light": require("@/assets/fonts/CormorantGaramond-Light.ttf"),
    "CormorantGaramond-Regular": require("@/assets/fonts/CormorantGaramond-Regular.ttf"),
    "CormorantGaramond-Medium": require("@/assets/fonts/CormorantGaramond-Medium.ttf"),
    "CormorantGaramond-SemiBold": require("@/assets/fonts/CormorantGaramond-SemiBold.ttf"),
    "CormorantGaramond-Bold": require("@/assets/fonts/CormorantGaramond-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardProvider>
      <TRPCReactProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(modals)"
                  options={{ headerShown: false, presentation: "modal" }}
                />
              </Stack>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </TRPCReactProvider>
    </KeyboardProvider>
  );
}
