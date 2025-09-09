export type LovelaceCardFeatureConfig = {
  type: string;
} & Record<string, any>;

export interface LovelaceCardFeatureContext {
  entity_id?: string;
  area_id?: string;
}
