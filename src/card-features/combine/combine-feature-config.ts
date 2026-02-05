import { LovelaceCardFeatureConfig } from "../../ha";

export type CombineFeatureLayout = "compact" | "inline";

export interface CombineFeatureConfig extends LovelaceCardFeatureConfig {
  type: "custom:mushroom-combine-card-feature";
  features: LovelaceCardFeatureConfig[];
  layout?: CombineFeatureLayout;
}
