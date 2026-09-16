export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export interface PackedBudgetJson {
  format: 'budget-packed-v1';
  strings: string[];
  shapes: string[][];
  root: JsonValue;
}
export interface BudgetRecord {
  record_id: string;
  district: string;
  view_id: string;
  canonical_view_id?: string;
  related_districts?: string[];
  view_role?: string;
  [key: string]: unknown;
}
export type DistrictMetric = 'office' | 'central' | 'minimum';
export interface DistrictBudget {
  district: string;
  district_office_budget?: number | null;
  central_exclusive_budget_safe_to_attribute?: number | null;
  minimum_verified_budget?: number | null;
  [key: string]: unknown;
}
export interface MapEntry { value: number | null; rank: number | null; band: number }
export function allocationArcs<T extends { amount: number }>(parts: T[], total: number): Array<T & { share: number; d: string }>;
export function logicalRecordKey(record: Pick<BudgetRecord, 'record_id' | 'district'>): string;
export function mergeUniqueSearchRecords(records: BudgetRecord[], details: BudgetRecord[]): BudgetRecord[];
export function indexCanonicalDistricts(records: BudgetRecord[], validDistricts: string[]): Map<string, string[]>;
export function packBudgetJson(input: JsonValue): PackedBudgetJson;
export function unpackBudgetJson(packed: unknown): JsonValue;
export function fetchBudgetJson(url: string | URL): Promise<JsonValue>;
export function mapMetricValue(row: DistrictBudget | null | undefined, metric: DistrictMetric): number | null;
export function districtMapScale<T extends DistrictBudget>(districts: T[], metric: DistrictMetric): { ordered: T[]; entries: Map<string, MapEntry>; unrankedCount: number };
export function mapRoute(district?: string, metric?: DistrictMetric): string;
export function mapCameraViewBox(view: { x: number; y: number; zoom: number }, width: number, height: number, mapWidth: number, mapHeight: number): [number, number, number, number];
