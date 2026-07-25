import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { RouterOutputs } from "@repo/api";
import { useTRPC } from "@/utils/api";
import { deleteAuthToken, getAuthToken, setAuthToken } from "@/utils/token";

type User = RouterOutputs["auth"]["me"]["user"];

type AuthContext = {
  user: User | null;
  status: "loggedIn" | "loggedOut" | undefined;
  login: (args: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  register: (args: {
    email: string;
    password: string;
    passwordConfirm: string;
    firstName: string;
    lastName?: string;
    phone: string;
    otp: string;
    isPhoneVerified: boolean;
    accountType: "customer" | "vendor";
  }) => Promise<void>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContext>({} as AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"loggedIn" | "loggedOut" | undefined>();
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          setUser(null);
          setStatus("loggedOut");
          setHasRestored(true);
          return;
        }

        const meUser = await queryClient.fetchQuery(
          trpc.auth.me.queryOptions(),
        );
        setUser(meUser.user);
        setStatus("loggedIn");
      } catch {
        await deleteAuthToken();
        setUser(null);
        setStatus("loggedOut");
      } finally {
        setHasRestored(true);
      }
    };

    void restoreSession();
  }, [trpc, queryClient]);

  const loginMutation = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: async (data) => {
        if (data.token) {
          await setAuthToken(data.token);
        }
        setUser(data.data ?? null);
        setStatus("loggedIn");
      },
    }),
  );

  const registerMutation = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: async (data) => {
        if (data.token) {
          await setAuthToken(data.token);
        }
        if (data.data) {
          setUser(data.data);
          setStatus("loggedIn");
        }
      },
    }),
  );

  const logoutMutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSettled: async () => {
        await deleteAuthToken();
        setUser(null);
        setStatus("loggedOut");
      },
    }),
  );

  const login = useCallback<AuthContext["login"]>(
    async (args) => {
      const result = await loginMutation.mutateAsync(args);
      return result.data!;
    },
    [loginMutation],
  );

  const register = useCallback<AuthContext["register"]>(
    async (args) => {
      await registerMutation.mutateAsync(args);
    },
    [registerMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  if (!hasRestored) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{ user, status, login, logout, register, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
