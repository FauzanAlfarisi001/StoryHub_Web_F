import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../types";
import { storyhub, tokenStore } from "../api/storyhub";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(tokenStore.user);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!tokenStore.access) {
      setUser(null);
      setLoading(false);
      return;
    }
    storyhub
      .verify()
      .then(async ({ user: verifiedUser }) => {
        let nextUser = verifiedUser;
        try {
          const { user: profileUser } = await storyhub.profile();
          nextUser = {
            ...verifiedUser,
            ...profileUser,
            role: profileUser.role || verifiedUser.role,
          };
        } catch {
        }
        setUser(nextUser);
        tokenStore.setUser(nextUser);
      })
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const response = await storyhub.login(email, password);
        tokenStore.setSession(
          response.access_token,
          response.refresh_token,
          response.user,
        );
        let authenticatedUser = response.user;
        try {
          const { user: profileUser } = await storyhub.profile();
          authenticatedUser = {
            ...response.user,
            ...profileUser,
            role: profileUser.role || response.user.role,
          };
        } catch {}
        tokenStore.setUser(authenticatedUser);
        setUser(authenticatedUser);
      },
      register: async (data) => {
        await storyhub.register(data);
      },
      logout: async () => {
        try {
          await storyhub.logout();
        } finally {
          setUser(null);
        }
      },
      refreshProfile: async () => {
        const r = await storyhub.profile();
        const nextUser = { ...(tokenStore.user || {}), ...r.user } as User;
        tokenStore.setUser(nextUser);
        setUser(nextUser);
      },
    }),
    [user, loading],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
