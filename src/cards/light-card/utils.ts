import { hsv2rgb, rgb2hsv } from "../../ha/common/color/convert-color";
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
  const hsvColor = rgb2hsv([rgbColor[0], rgbColor[1], rgbColor[2]]);
  if (hsvColor[1] < 0.4) {
    if (hsvColor[1] < 0.1) {
      hsvColor[2] = 225;
    } else {
      hsvColor[1] = 0.4;
    }
  }
  return hsv2rgb(hsvColor);
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
