import "./light-color/light-color-feature";
import "./light-color/light-color-feature-editor";
import { supportsLightColorFeature } from "./light-color/light-color-feature";

declare global {
  interface Window {
    customCardFeatures?: Array<{
      type: string;
      name: string;
      supported?: (stateObj: unknown) => boolean;
      configurable?: boolean;
    }>;
  }
}

// Register custom card features
window.customCardFeatures = window.customCardFeatures || [];
window.customCardFeatures.push({
  type: "mushroom-light-color-card-feature",
  name: "Mushroom Light color",
  supported: (stateObj) => supportsLightColorFeature(stateObj as any),
  configurable: true,
});
