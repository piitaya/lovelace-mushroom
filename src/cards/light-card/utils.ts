import { rgb, hsv} from "culori";
import {
  LightColorMode,
  LightEntity,
  lightSupportsColor,
  lightSupportsBrightness,
} from "../../ha";

export function getBrightness(entity: LightEntity): number | undefined {
  return entity.attributes.brightness != null
    ? Math.max(Math.round((entity.attributes.brightness * 100) / 255), 1)
    : undefined;
}

export function getColorTemp(entity: LightEntity): number | undefined {
  return entity.attributes.color_temp != null
    ? Math.round(entity.attributes.color_temp)
    : undefined;
}

export function getRGBColor(entity: LightEntity): number[] | undefined {
  return entity.attributes.rgb_color != null
    ? entity.attributes.rgb_color
    : undefined;
}

export function improveColorContrast(rgbColor: number[]): number[] {
  let { h, s, v } = hsv({
    mode: "rgb" as const,
    r: rgbColor[0] / 255,
    g: rgbColor[1] / 255,
    b: rgbColor[2] / 255,
  });
  if (v > 0.85 && s < 0.4) {
    if (s < 0.1) {
      v = Math.min(v, 225/255);
    } else {
      s = 0.4;
    }
    const adjustedRgb = rgb({ mode: "hsv", h, s, v });
    return [
      Math.round(adjustedRgb.r * 255),
      Math.round(adjustedRgb.g * 255),
      Math.round(adjustedRgb.b * 255)
    ];
  }
  return rgbColor;
}

export function supportsColorTempControl(entity: LightEntity): boolean {
  return (
    entity.attributes.supported_color_modes?.some((m) =>
      [LightColorMode.COLOR_TEMP].includes(m)
    ) ?? false
  );
}

export function supportsColorControl(entity: LightEntity): boolean {
  return lightSupportsColor(entity);
}

export function supportsBrightnessControl(entity: LightEntity): boolean {
  return lightSupportsBrightness(entity);
}
