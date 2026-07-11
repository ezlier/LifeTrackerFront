const TOKEN_KEY = "lifetrackr_token";
const USER_KEY = "lifetrackr_user";
const USER_ID_KEY = "lifetrackr_uid";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUsername(): string | null {
  return localStorage.getItem(USER_KEY);
}

export function setStoredUsername(username: string): void {
  localStorage.setItem(USER_KEY, username);
}

export function getStoredUserId(): number | null {
  const v = localStorage.getItem(USER_ID_KEY);
  return v ? Number(v) : null;
}

export function setStoredUserId(id: number): void {
  localStorage.setItem(USER_ID_KEY, String(id));
}

export function clearUserData(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_ID_KEY);
}
