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

export interface SignupParams {
  username: string;
  newPwd: string;
  newPwd2: string;
}

export function signupApi(params: SignupParams): Promise<void> {
  return http.post("/user/create", params);
}
