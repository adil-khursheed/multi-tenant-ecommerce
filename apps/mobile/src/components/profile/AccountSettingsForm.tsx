import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/responsive";
import { colors, fonts, fontSizes, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/providers/Auth";
import { useTRPC } from "@/utils/api";

export function AccountSettingsForm() {
  const { user, setUser } = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [changePassword, setChangePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  const updateProfileMutation = useMutation(
    trpc.auth.updateProfile.mutationOptions({
      onSuccess: (data) => {
        setUser(data.user);
        Alert.alert("Success", "Account updated successfully.");
      },
      onError: () => {
        Alert.alert("Error", "There was a problem updating your account.");
      },
    }),
  );

  const changePasswordMutation = useMutation(
    trpc.auth.changePassword.mutationOptions({
      onSuccess: () => {
        setPassword("");
        setPasswordConfirm("");
        setChangePassword(false);
        Alert.alert("Success", "Password changed successfully.");
      },
      onError: (error) => {
        Alert.alert(
          "Error",
          error.message || "There was a problem changing your password.",
        );
      },
    }),
  );

  const handleUpdateProfile = useCallback(() => {
    if (!name.trim()) {
      Alert.alert("Error", "Please provide a name.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please provide an email.");
      return;
    }
    updateProfileMutation.mutate({ name: name.trim(), email: email.trim() });
  }, [name, email, updateProfileMutation]);

  const handleChangePassword = useCallback(() => {
    if (!password) {
      Alert.alert("Error", "Please provide a new password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    changePasswordMutation.mutate({ password, passwordConfirm });
  }, [password, passwordConfirm, changePasswordMutation]);

  if (changePassword) {
    return (
      <View style={styles.container}>
        <View style={styles.toggleRow}>
          <Text style={styles.description}>
            Change your password below, or{" "}
          </Text>
          <Pressable onPress={() => setChangePassword(false)}>
            <Text style={styles.toggleLink}>cancel</Text>
          </Pressable>
        </View>

        <View style={styles.fields}>
          <View style={styles.field}>
            <Text style={styles.label}>New password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="Confirm new password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        </View>

        <Pressable
          style={[
            styles.button,
            changePasswordMutation.isPending && styles.buttonDisabled,
          ]}
          onPress={handleChangePassword}
          disabled={changePasswordMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {changePasswordMutation.isPending
              ? "Processing..."
              : "Change Password"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <Text style={styles.description}>
          Change your account details below, or{" "}
        </Text>
        <Pressable onPress={() => setChangePassword(true)}>
          <Text style={styles.toggleLink}>click here</Text>
        </Pressable>
        <Text style={styles.description}> to change your password.</Text>
      </View>

      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="words"
          />
        </View>
      </View>

      <Pressable
        style={[
          styles.button,
          updateProfileMutation.isPending && styles.buttonDisabled,
        ]}
        onPress={handleUpdateProfile}
        disabled={updateProfileMutation.isPending}
      >
        <Text style={styles.buttonText}>
          {updateProfileMutation.isPending ? "Processing..." : "Update Account"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(spacing[4]),
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  description: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.mutedForeground,
  },
  toggleLink: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.primary,
    textDecorationLine: "underline",
  },
  fields: {
    gap: verticalScale(spacing[4]),
  },
  field: {
    gap: verticalScale(spacing[1.5]),
  },
  label: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.sm),
    color: colors.foreground,
  },
  input: {
    fontFamily: fonts.sans.regular,
    fontSize: moderateScale(fontSizes.base),
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
    paddingVertical: verticalScale(spacing[3.5]),
    alignItems: "center",
    marginTop: verticalScale(spacing[2]),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fonts.sans.medium,
    fontSize: moderateScale(fontSizes.base),
    color: colors.primaryForeground,
  },
});
