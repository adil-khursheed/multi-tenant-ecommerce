import { useEffect } from "react";
import { Platform } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from "sp-react-native-in-app-updates";

import { AuthProvider } from "../providers/Auth";
import { CartProvider } from "../providers/Cart";
import { CurrencyProvider } from "../providers/Currency";
import { TRPCReactProvider } from "../utils/api";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "DMSans-Light": require("../../assets/fonts/DMSans-Light.ttf"),
    "DMSans-Regular": require("../../assets/fonts/DMSans-Regular.ttf"),
    "DMSans-Medium": require("../../assets/fonts/DMSans-Medium.ttf"),
    "DMSans-SemiBold": require("../../assets/fonts/DMSans-SemiBold.ttf"),
    "DMSans-Bold": require("../../assets/fonts/DMSans-Bold.ttf"),
    "CormorantGaramond-Light": require("../../assets/fonts/CormorantGaramond-Light.ttf"),
    "CormorantGaramond-Regular": require("../../assets/fonts/CormorantGaramond-Regular.ttf"),
    "CormorantGaramond-Medium": require("../../assets/fonts/CormorantGaramond-Medium.ttf"),
    "CormorantGaramond-SemiBold": require("../../assets/fonts/CormorantGaramond-SemiBold.ttf"),
    "CormorantGaramond-Bold": require("../../assets/fonts/CormorantGaramond-Bold.ttf"),
  });

  const inAppUpdates = new SpInAppUpdates(
    false, // isDebug
  );

  inAppUpdates.checkNeedsUpdate().then((result) => {
    if (result.shouldUpdate) {
      let updateOptions: StartUpdateOptions = {};
      if (Platform.OS === "android") {
        // android only, on iOS the user will be prompted to go to your app store page
        updateOptions = {
          updateType: IAUUpdateKind.FLEXIBLE,
        };
      }
      inAppUpdates.startUpdate(updateOptions);
    }
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
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
                  options={{
                    headerShown: false,
                    presentation: "modal",
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen name="(shop)" options={{ headerShown: false }} />
              </Stack>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </TRPCReactProvider>
    </KeyboardProvider>
  );
}
