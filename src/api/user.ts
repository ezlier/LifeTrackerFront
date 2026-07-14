import api from "./http";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  Introduction: string | null;
}

export function getUser(): Promise<User> {
  return api.get("/user");
}

export function updateUser(user: Partial<User>): Promise<User> {
  return api.put("/user", user);
}

export interface ChangePasswordParams {
  password: string;
  newPwd: string;
  newPwd2: string;
}

export function changePassword(params: ChangePasswordParams): Promise<void> {
  return api.put("/user", params);
}
