import http from "./http";

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  id: number;
  username: string;
  token: string;
}

export function loginApi(params: LoginParams): Promise<LoginResult> {
  return http.post("/login", params);
}

export function signupApi(params: LoginParams): Promise<void> {
  return http.post("/signup", params);
}
