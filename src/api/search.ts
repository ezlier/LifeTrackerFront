import api from "./http";

export interface SearchQuery {
  type: string;
  keyword: string;
}

export interface SearchResult {
  sourceId: string
  title: string
  cover: string
  description: string
}

export interface MetadataDetail {
  sourceId: string
  title: string
  cover: string
  description: string
}

export interface DetailQuery {
  sourceId: string
  type: string
}

export function search(params: SearchQuery) {
  return api.get<SearchResult[]>("/metadata/search", { params })
}

export function getMetadataDetail(params: DetailQuery) {
  return api.get<MetadataDetail>("/metadata/detail", { params })
}
