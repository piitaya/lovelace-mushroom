import * as Color from "color";
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
    const color = Color.hsv(360 * percent, 100, 100);
    return color.rgb().array();
  }

  _rgbToPercent(rgb: number[]): number {
    const color = Color.rgb(rgb);
    return color.hsv().hue() / 360;
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
      />
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
