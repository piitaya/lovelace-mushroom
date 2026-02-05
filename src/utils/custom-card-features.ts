interface CustomCardFeature {
  type: string;
  name: string;
  supported?: (stateObj: unknown) => boolean;
  configurable?: boolean;
}

declare global {
  interface Window {
    customCardFeatures?: CustomCardFeature[];
  }
}

interface RegisterCardFeatureParams {
  type: string;
  name: string;
  supported?: (stateObj: unknown) => boolean;
  configurable?: boolean;
}

export function registerCustomCardFeature(params: RegisterCardFeatureParams) {
  window.customCardFeatures = window.customCardFeatures || [];
  window.customCardFeatures.push(params);
}
