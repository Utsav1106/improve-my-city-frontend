import { callApi } from "@/services/api";
import { getMyUser } from "@/services/auth";
import { type User } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
    token: string;
    user: User | null;
    setToken: (token: string) => void;
    setUser: (user: User | null) => void;
    login: (email?: string, password?: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            token: '',
            user: null,
            setToken: (token: string) => set({ token }),
            setUser: (user: User | null) => set({ user }),
            logout: () => set({ token: '', user: null }),
            login: async (email?: string, password?: string) => {
                try {
                    if (email || password) {
                        const response = await callApi('/auth/sign-in', {
                            method: 'POST',
                            body: { email, password },
                        })
                        const data = response as { token: string }
                        set({ token: data.token })
                    }
                    const user = await getMyUser()
                    set({ user })
                } catch (e) {
                    if (email || password) throw new Error("Invalid email or password")
                    console.error("Failed to load user", e)
                }
            },
            register: async (name: string, email: string, password: string) => {
                const response = await callApi('/auth/sign-up', {
                    method: 'POST',
                    body: { name, email, password },
                })
                const data = response as { token: string }
                set({ token: data.token })
                const user = await getMyUser()
                set({ user })
            }
        }),
        {
            name: 'token',
            partialize: (state) => ({
                token: state.token
            })
        }
    )
)