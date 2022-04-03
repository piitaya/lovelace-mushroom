import { formatNumber, HomeAssistant, UNIT_F } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import "../../../shared/slider";
import { getSetTemp } from "../utils";

@customElement("mushroom-thermostat-temperature-control")
export class ThermostatTemperatureControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property({ type: Boolean }) public showIndicators = false;

    @property({ type: Number }) public gap!: number;

    @state() private _setTemps?: number | number[];

    private get _stepSize(): number {
        if (this.entity.attributes.target_temp_step) {
            return this.entity.attributes.target_temp_step;
        }
        return this.hass!.config.unit_system.temperature === UNIT_F ? 1 : 0.5;
    }

    onChange(e: CustomEvent<{ value?: number; secondary?: number }>): void {
        if (e.detail.value) {
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
        if (e.detail.value) {
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
            this._stepSize === 1
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

        const { min_temp, max_temp, target_temp_high, target_temp_low } = this.entity.attributes;

        return html`${this.showIndicators
                ? html`<shroom-state-value
                      value=${this.formatIndicator(this._setTemps![0])}
                      style=${styleMap({
                          "--text-color": "rgb(var(--rgb-action-climate-heating))",
                          "--bg-color": "rgba(var(--rgb-action-climate-heating), 0.05)",
                      })}
                  ></shroom-state-value>`
                : null}
            <mushroom-slider
                .showActive=${true}
                .disabled=${state === "off"}
                .value=${target_temp_low}
                .secondary=${target_temp_high}
                .min=${min_temp ?? 45}
                .max=${max_temp ?? 95}
                .step=${this._stepSize}
                .gap=${this.gap}
                @change=${this.onChange}
                @current-change=${this.onCurrentChange}
            >
            </mushroom-slider>
            ${this.showIndicators
                ? html`<shroom-state-value
                      value=${this.formatIndicator(this._setTemps![1])}
                      style=${styleMap({
                          "--text-color": "rgb(var(--rgb-action-climate-cooling))",
                          "--bg-color": "rgba(var(--rgb-action-climate-cooling), 0.05)",
                      })}
                  ></shroom-state-value>`
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
