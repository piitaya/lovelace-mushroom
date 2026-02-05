export type LovelaceCardFeatureConfig = {
  type: string;
} & Record<string, any>;

export interface LovelaceCardFeatureContext {
  entity_id?: string;
  area_id?: string;
}

export interface LovelaceCardFeature extends HTMLElement {
  hass?: any;
  stateObj?: any;
  setConfig(config: LovelaceCardFeatureConfig): void;
}
