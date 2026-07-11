import api from "./http";

export interface HeatmapEntry {
  date: string;
  count: number;
}

/** GET /heatmap/{year} — 全年每日活动数量 */
export function getHeatmap(year: number): Promise<HeatmapEntry[]> {
  return api.get(`/heatmap/${year}`);
}

export interface PieChartEntry {
  name: string;
  value: number;
}

export function getTypePieChartData(): Promise<Record<string, number>> {
  return api.get(`/heatmap/type`);
}

export function getStatusPieChartData(): Promise<Record<string, number>> {
  return api.get(`/heatmap/status`);
}
