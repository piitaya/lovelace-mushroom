import { LovelaceCardFeatureConfig } from "../../ha";

export interface LightColorFeatureConfig extends LovelaceCardFeatureConfig {
  type: "custom:mushroom-light-color-card-feature";
  show_hue?: boolean;
  show_saturation?: boolean;
}
