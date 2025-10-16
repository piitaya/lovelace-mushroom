import {
  css,
  html,
  LitElement,
  TemplateResult,
  type CSSResultGroup,
} from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import memoizeOne from "memoize-one";
import { HomeAssistant, isActive, isAvailable, LightEntity } from "../../../ha";
import { rgb2hex } from "../../../ha/common/color/convert-color";
import {
  DEFAULT_MAX_KELVIN,
  DEFAULT_MIN_KELVIN,
  temperature2rgb,
} from "../../../ha/common/color/convert-light-color";
import "../../../shared/slider";

export const generateColorTemperatureGradient = (min: number, max: number) => {
  const count = 10;

  const gradient: [number, string][] = [];

  const step = (max - min) / count;
  const percentageStep = 1 / count;

  for (let i = 0; i < count + 1; i++) {
    const value = min + step * i;

    const hex = rgb2hex(temperature2rgb(value));
    gradient.push([percentageStep * i, hex]);
  }

  return gradient
    .map(([stop, color]) => `${color} ${(stop as number) * 100}%`)
    .join(", ");
};

@customElement("mushroom-light-color-temp-control")
export class LightColorTempControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: LightEntity;

  onChange(e: CustomEvent<{ value: number }>): void {
    e.stopPropagation();
    const value = e.detail.value;

    this.hass.callService("light", "turn_on", {
      entity_id: this.entity.entity_id,
      color_temp_kelvin: value,
    });
  }

  private _generateTemperatureGradient = memoizeOne(
    (min: number, max: number) => generateColorTemperatureGradient(min, max)
  );

  protected render(): TemplateResult {
    const colorTemp =
      this.entity.attributes.color_temp_kelvin != null
        ? this.entity.attributes.color_temp_kelvin
        : undefined;

    const minKelvin =
      this.entity.attributes.min_color_temp_kelvin ?? DEFAULT_MIN_KELVIN;
    const maxKelvin =
      this.entity.attributes.max_color_temp_kelvin ?? DEFAULT_MAX_KELVIN;

    const gradient = this._generateTemperatureGradient(minKelvin!, maxKelvin);

    console.log(gradient);
    return html`
      <mushroom-slider
        .value=${colorTemp}
        .disabled=${!isAvailable(this.entity)}
        .inactive=${!isActive(this.entity)}
        .min=${minKelvin}
        .max=${maxKelvin}
        .showIndicator=${true}
        @change=${this.onChange}
        style=${styleMap({
          "--temp-gradient": gradient,
        })}
      />
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      mushroom-slider {
        --gradient: -webkit-linear-gradient(left, var(--temp-gradient));
      }
    `;
  }
}
