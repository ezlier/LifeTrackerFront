import api from "./http";

export interface AdminUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  introduction: string | null;
  isAdmin: string;
}

export interface UserListResponse {
  total: number;
  pageSize: number;
  list: AdminUser[];
}

export function getUsers(params?: { page?: number; pageSize?: number }) {
  return api.get<UserListResponse>("/Admin/User", { params });
}

// 重置密码
export function resetPwd(id: number) {
  return api.patch(`/Admin/User/pwd`, { id });
}

// 切换管理员权限
export function switchAdmin(id: number) {
  return api.patch(`/Admin/User/switch`, { id });
}

// 删除用户
export function deleteUser(ids: number[]) {
  return api.delete(`/Admin/User/${ids.join(",")}`);
}

// ==================================

export interface MediaItem {
  id: number;
  name: string;
  type: string;
  title: string;
  cover: string;
  description: string;
  rating: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemListResponse {
  total: number;
  pageSize: number;
  list: MediaItem[];
}

export function getItems(params?: { pageNum?: number; pageSize?: number }) {
  return api.get<ItemListResponse>("/Admin/Item", { params });
}

export function deleteItem(ids: number[]) {
  return api.delete(`/Admin/Item/${ids.join(",")}`);
}

// ==================================

export interface Timeline {
  id: number;
  userName: string;
  eventType: string;
  description: string;
  createdAt: string;
}

export interface TimelineListResponse {
  total: number;
  pageSize: number;
  list: Timeline[];
}

export function getTimeline(params?: { pageNum?: number; pageSize?: number }) {
  return api.get<TimelineListResponse>("/Admin/TimeLineEvent", { params });
}

export function deleteTimeline(ids: number[]) {
  return api.delete(`/Admin/TimeLineEvent/${ids.join(",")}`);
}

// ==================================

export interface Focus {
  id: number;
  userName: string;
  mode: string;
  goal: string;
  status: string;
  createTime: string;
}

export interface FocusListResponse {
  total: number;
  pageSize: number;
  list: Focus[];
}

export function getFocus(params?: { pageNum?: number; pageSize?: number }) {
  return api.get<FocusListResponse>("/Admin/FocusSession", { params });
}

export function deleteFocus(ids: number[]) {
  return api.delete(`/Admin/FocusSession/${ids.join(",")}`);
}
