import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { loginApi, type LoginParams } from "@/api/auth";
import {
  setToken,
  removeToken as clearToken,
  getToken,
  getStoredUsername,
  getStoredUserId,
  setStoredUsername,
  setStoredUserId,
  clearUserData,
} from "@/utils/auth";
import router from "@/router";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(getToken());
  const username = ref<string | null>(getStoredUsername());
  const userId = ref<number | null>(getStoredUserId());
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isLoggedIn = computed(() => !!token.value);

  async function login(params: LoginParams) {
    loading.value = true;
    error.value = null;
    try {
      const data = await loginApi(params);
      token.value = data.token;
      username.value = data.username;
      userId.value = data.id;
      setToken(data.token);
      setStoredUsername(data.username);
      setStoredUserId(data.id);
      router.push("/dashboard");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      error.value = msg;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    username.value = null
    userId.value = null
    clearToken()
    clearUserData();
    router.push("/login");
  }

  return { token, username, userId, loading, error, isLoggedIn, login, logout };
});
