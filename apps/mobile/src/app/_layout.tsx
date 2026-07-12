import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { TRPCReactProvider } from "../utils/api";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <TRPCReactProvider>
      <Stack />
    </TRPCReactProvider>
  );
}
