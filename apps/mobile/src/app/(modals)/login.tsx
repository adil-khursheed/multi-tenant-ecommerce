import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/providers/Auth";
import { colors, fonts, fontSizes, spacing, radii } from "@/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.back();
    } catch {
      Alert.alert("Error", "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.linkButton}
              onPress={() => router.push("/(modals)/register")}
            >
              <Text style={styles.linkText}>
                Don't have an account?{" "}
                <Text style={styles.linkTextBold}>Sign Up</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing[6],
    justifyContent: "center",
  },
  header: {
    marginBottom: spacing[8],
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: fontSizes["3xl"],
    color: colors.foreground,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSizes.base,
    color: colors.mutedForeground,
  },
  form: {
    gap: spacing[5],
  },
  field: {
    gap: spacing[2],
  },
  label: {
    fontFamily: fonts.sans.medium,
    fontSize: fontSizes.sm,
    color: colors.foreground,
  },
  input: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSizes.base,
    color: colors.foreground,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing[3.5],
    alignItems: "center",
    marginTop: spacing[2],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fonts.sans.medium,
    fontSize: fontSizes.base,
    color: colors.primaryForeground,
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: spacing[2],
  },
  linkText: {
    fontFamily: fonts.sans.regular,
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
  },
  linkTextBold: {
    fontFamily: fonts.sans.medium,
    color: colors.primary,
  },
});
