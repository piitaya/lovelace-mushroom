import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, unsafeCSS, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import * as Color from "color";
import "../../../shared/slider";
import { isAvailable } from "../../../utils/entity";

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
        const state = this.entity.state;

        const colorPercent =
            this._percent || this._rgbToPercent(this.entity.attributes.rgb_color) * 100;

        const sliderStyle = {};
        if (state === "off") {
            sliderStyle["--gradient"] = "none";
        }

        return html`
            <mushroom-slider
                style=${styleMap(sliderStyle)}
                .value=${colorPercent}
                .disabled=${!isAvailable(this.entity)}
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
