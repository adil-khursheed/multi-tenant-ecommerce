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
import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

import { colors, fonts, fontSizes, spacing } from "@/constants/theme";
import { useAuth } from "@/providers/Auth";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !firstName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !passwordConfirm.trim()
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim(),
        password,
        passwordConfirm,
        otp: "",
        isPhoneVerified: false,
        accountType: "customer",
      });
      router.back();
    } catch {
      Alert.alert("Error", "Registration failed. Please try again.");
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join DTlea today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.field, styles.half]}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                  placeholderTextColor={colors.mutedForeground}
                  autoComplete="given-name"
                />
              </View>
              <View style={[styles.field, styles.half]}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                  placeholderTextColor={colors.mutedForeground}
                  autoComplete="family-name"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email *</Text>
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
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="Re-enter password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Text>
            </Pressable>

            <Pressable style={styles.linkButton} onPress={() => router.back()}>
              <Text style={styles.linkText}>
                Already have an account?{" "}
                <Text style={styles.linkTextBold}>Sign In</Text>
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
  },
  header: {
    marginBottom: spacing[6],
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
    gap: spacing[4],
  },
  row: {
    flexDirection: "row",
    gap: spacing[3],
  },
  half: {
    flex: 1,
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  button: {
    backgroundColor: colors.primary,
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
