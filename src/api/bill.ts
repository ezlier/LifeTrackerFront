import api from "./http";

export interface Bill {
  id: number;
  counterparty: string;
  goods: string;
  income: string;
  money: number;
  tradingHours: string;
}

export interface BillListResponse {
  total: number;
  pageSize: number;
  list: Bill[];
}

export interface BillListParams {
  pageNum?: number;
  pageSize?: number;
  income?: string;
}

export function getBillList(params?: BillListParams) {
  return api.get<BillListResponse>("/bill", { params });
}

export function createBill(data: Omit<Bill, "id">) {
  return api.post("/bill", data);
}

export function deleteBill(ids: number[]) {
  return api.delete(`/bill/${ids.join(",")}`);
}

export function uploadBillFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/bill/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
