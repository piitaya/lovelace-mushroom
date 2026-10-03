import { hsv, rgb } from "culori";
import { HassEntity } from "home-assistant-js-websocket";
import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  TemplateResult,
  unsafeCSS,
} from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, isActive, isAvailable } from "../../../ha";
import "../../../shared/slider";

const GRADIENT = [
  [0, "#f00"],
  [0.17, "#ff0"],
  [0.33, "#0f0"],
  [0.5, "#0ff"],
  [0.66, "#00f"],
  [0.83, "#f0f"],
  [1, "#f00"],
];

@customElement("mushroom-light-color-control")
export class LightColorControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: HassEntity;

  _percent = 0;

  _percentToRGB(percent: number): number[] {
    const rgbColor = rgb({
      mode: "hsv" as const,
      h: 360 * percent,
      s: 1,
      v: 1,
    });
    if (rgbColor) {
      return [
        Math.round(rgbColor.r * 255),
        Math.round(rgbColor.g * 255),
        Math.round(rgbColor.b * 255),
      ];
    }
    return [0, 0, 0];
  }

  _rgbToPercent(rgb: number[]): number {
    const hsvColor = hsv({
      mode: "rgb",
      r: rgb[0] / 255,
      g: rgb[1] / 255,
      b: rgb[2] / 255,
    });
    return (hsvColor?.h || 0) / 360;
  }

  onChange(e: CustomEvent<{ value: number }>): void {
    const value = e.detail.value;
    this._percent = value;

    const rgb_color = this._percentToRGB(value / 100);

    if (rgb_color.length === 3) {
      this.hass.callService("light", "turn_on", {
        entity_id: this.entity.entity_id,
        rgb_color,
      });
    }
  }

  protected render(): TemplateResult {
    const colorPercent =
      this._percent ||
      this._rgbToPercent(this.entity.attributes.rgb_color) * 100;

    return html`
      <mushroom-slider
        .value=${colorPercent}
        .disabled=${!isAvailable(this.entity)}
        .inactive=${!isActive(this.entity)}
        .min=${0}
        .max=${100}
        .showIndicator=${true}
        @change=${this.onChange}
      ></mushroom-slider>
    `;
  }

  static get styles(): CSSResultGroup {
    const gradient = GRADIENT.map(
      ([stop, color]) => `${color} ${(stop as number) * 100}%`
    ).join(", ");
    return css`
      mushroom-slider {
        --gradient: -webkit-linear-gradient(left, ${unsafeCSS(gradient)});
      }
    `;
  }
}
