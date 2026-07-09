import api from "./http";

export interface ItemRecord {
  id: number;
  userId: number;
  type: string;
  title: string;
  description: string | null;
  rating: number | null;
  status: "planned" | "doing" | "done";
  cover: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemPage {
  records: ItemRecord[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface ItemQuery {
  type?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface ItemCreate {
  type: string;
  title: string;
  description?: string;
  cover?: string;
  status?: string;
}

export interface ItemUpdate {
  id: number | string;
  title?: string;
  cover?: string;
  type?: string;
  description?: string;
  rating?: number;
  status?: string;
}

/** GET /item — paginated list */
export function getItems(params?: ItemQuery): Promise<ItemPage> {
  return api.get("/item", { params });
}

/** GET /item/:id — single item */
export function getItem(id: number): Promise<ItemRecord> {
  return api.get(`/item/${id}`);
}

/** POST /item */
export function createItem(data: ItemCreate): Promise<null> {
  return api.post("/item", data);
}

/** PUT /item */
export function updateItem(data: ItemUpdate): Promise<null> {
  return api.put("/item", data);
}

/** DELETE /item — batch */
export function deleteItems(ids: number[]): Promise<null> {
  return api.delete("/item", { data: ids });
}
