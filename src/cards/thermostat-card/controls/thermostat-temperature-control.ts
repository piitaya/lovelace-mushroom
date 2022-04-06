import { formatNumber, HomeAssistant, UNIT_F } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import "../../../shared/slider";
import { isActive } from "../../../utils/entity";
import { Indicator } from "../types";
import { getSetTemp, getStepSize } from "../utils";

@customElement("mushroom-thermostat-temperature-control")
export class ThermostatTemperatureControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property({ type: Boolean }) public showIndicators = false;

    @property({ type: Number }) public gap!: number;

    @state() private _setTemps: number | number[] = [];

    onChange(e: CustomEvent<{ value?: number; secondary?: number }>): void {
        if (!isActive(this.entity)) return;
        if (this.entity.attributes.temperature) {
            this.hass!.callService("climate", "set_temperature", {
                entity_id: this.entity.entity_id,
                temperature: e.detail.value ?? e.detail.secondary,
            });
        } else if (e.detail.value) {
            this.hass!.callService("climate", "set_temperature", {
                entity_id: this.entity.entity_id,
                target_temp_low: e.detail.value,
                target_temp_high: this.entity.attributes.target_temp_high,
            });
        } else if (e.detail.secondary) {
            this.hass!.callService("climate", "set_temperature", {
                entity_id: this.entity.entity_id,
                target_temp_low: this.entity.attributes.target_temp_low,
                target_temp_high: e.detail.secondary,
            });
        }
    }

    onCurrentChange(e: CustomEvent<{ secondary?: number; value?: number }>): void {
        if (!isActive(this.entity)) return;
        if (this.entity.attributes.temperature && (e.detail.value || e.detail.secondary)) {
            this._setTemps = (e.detail.value ?? e.detail.secondary) as number;
        } else if (e.detail.value) {
            this._setTemps = [e.detail.value, this.entity.attributes.target_temp_high];
        } else if (e.detail.secondary) {
            this._setTemps = [this.entity.attributes.target_temp_low, e.detail.secondary];
        }
        this.dispatchEvent(
            new CustomEvent("current-change", {
                detail: {
                    high: e.detail.secondary,
                    low: e.detail.value,
                },
            })
        );
    }

    formatIndicator = (value: number) => {
        const options: Intl.NumberFormatOptions =
            getStepSize(this.hass, this.entity) === 1
                ? { maximumFractionDigits: 0 }
                : { maximumFractionDigits: 1, minimumFractionDigits: 1 };
        return formatNumber(value, this.hass.locale, options);
    };

    public willUpdate(changedProps: PropertyValues) {
        if (!this.hass || !this.entity || !changedProps.has("hass")) {
            return;
        }

        const oldHass = changedProps.get("hass") as HomeAssistant | undefined;

        if (!oldHass || oldHass.states[this.entity.entity_id] !== this.entity) {
            this._setTemps = getSetTemp(this.entity);
        }
    }

    protected render(): TemplateResult {
        const state = this.entity.state;

        const { min_temp, max_temp, target_temp_high, target_temp_low, temperature } =
            this.entity.attributes;

        const lowIndicator: Indicator = { style: {}, visible: false };
        const highIndicator: Indicator = { style: {}, visible: false };

        if (isActive(this.entity)) {
            lowIndicator.visible = (state === "heat" && temperature) || target_temp_low;
            lowIndicator.value = this._setTemps[0] ?? this._setTemps;
            lowIndicator.style = {
                "--text-color": "rgb(var(--rgb-action-climate-heating))",
                "--bg-color": "rgba(var(--rgb-action-climate-heating), 0.05)",
            };

            highIndicator.visible = (state === "cool" && temperature) || target_temp_high;
            highIndicator.value = this._setTemps[1] ?? this._setTemps;
            highIndicator.style = {
                "--text-color": "rgb(var(--rgb-action-climate-cooling))",
                "--bg-color": "rgba(var(--rgb-action-climate-cooling), 0.05)",
            };
        }

        return html`${this.showIndicators && lowIndicator.visible
                ? html`<mushroom-state-value
                      .value=${lowIndicator?.value}
                      style=${styleMap(lowIndicator?.style)}
                  ></mushroom-state-value>`
                : null}
            <mushroom-slider
                styles="--bg-color: rgba(var(--rgb-primary-text-color), 0.05);"
                .showActive=${true}
                .disabled=${!isActive(this.entity)}
                .value=${lowIndicator.visible ? target_temp_low || temperature : undefined}
                .secondary=${highIndicator.visible ? target_temp_high || temperature : undefined}
                .min=${min_temp ?? 45}
                .max=${max_temp ?? 95}
                .step=${getStepSize(this.hass, this.entity)}
                .gap=${this.gap}
                @change=${this.onChange}
                @current-change=${this.onCurrentChange}
            ></mushroom-slider>
            ${this.showIndicators && highIndicator.visible
                ? html`<mushroom-state-value
                      .value=${highIndicator?.value}
                      style=${styleMap(highIndicator.style)}
                  ></mushroom-state-value>`
                : null} `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                flex: auto;
                --cooling-color: rgb(var(--rgb-action-climate-cooling));
                --heating-color: rgb(var(--rgb-action-climate-heating));
                --slider-outline-color: transparent;
                --slider-bg-color: rgba(var(--rgb-secondary-text-color), 0.05);
            }
            :host :not(:last-child) {
                margin-right: var(--spacing);
            }
            mushroom-slider {
                flex: auto;
                --main-color: var(--heating-color);
                --secondary-color: var(--cooling-color);
                --bg-color: var(--slider-bg-color);
                --main-outline-color: var(--slider-outline-color);
            }
        `;
    }
}
