import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import "../../../shared/slider";
import { isAvailable } from "../../../utils/entity";
import { formatDegrees, getSetTemp, getStepSize, getTargetTemp } from "../utils";

@customElement("mushroom-thermostat-temperature-control")
export class ThermostatTemperatureControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property({ type: Boolean }) public showIndicators = false;

    @property({ type: Number }) public gap!: number;

    @state() private _setTemps: number | number[] = [];

    onChange(e: CustomEvent<{ value?: number; secondary?: number }>): void {
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
        const { min_temp, max_temp } = this.entity.attributes;

        const step = getStepSize(this.hass, this.entity);

        const lowTarget = getTargetTemp(this.entity, "low");
        const highTarget = getTargetTemp(this.entity, "high");

        const lowIndicator = formatDegrees(this.hass, this._setTemps[0] ?? this._setTemps, step);
        const highIndicator = formatDegrees(this.hass, this._setTemps[1] ?? this._setTemps, step);

        const indicator = (
            value: string,
            action: "cooling" | "heating"
        ) => html`<mushroom-state-value
            .value=${value}
            style=${styleMap({
                "--text-color": `rgb(var(--rgb-action-climate-${action}))`,
                "--bg-color": `rgba(var(--rgb-action-climate-${action}), 0.05)`,
            })}
        ></mushroom-state-value>`;

        return html`${this.showIndicators && lowTarget ? indicator(lowIndicator, "heating") : null}
            <mushroom-slider
                styles="--bg-color: rgba(var(--rgb-primary-text-color), 0.05);"
                .showActive=${true}
                .disabled=${!isAvailable(this.entity)}
                .value=${lowTarget}
                .secondary=${highTarget}
                .min=${min_temp ?? 45}
                .max=${max_temp ?? 95}
                .step=${step}
                .gap=${this.gap}
                @change=${this.onChange}
                @current-change=${this.onCurrentChange}
            ></mushroom-slider>
            ${this.showIndicators && highTarget ? indicator(highIndicator, "cooling") : null}`;
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
