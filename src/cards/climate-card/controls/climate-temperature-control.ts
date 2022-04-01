import { HomeAssistant, UNIT_F } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../../shared/slider";

@customElement("mushroom-climate-temperature-control")
export class ClimateTemperatureControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property({ type: Number }) public gap!: number;

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
        this.dispatchEvent(
            new CustomEvent("current-change", {
                detail: {
                    high: e.detail.secondary,
                    low: e.detail.value,
                },
            })
        );
    }

    protected render(): TemplateResult {
        const state = this.entity.state;

        const { min_temp, max_temp, target_temp_high, target_temp_low } = this.entity.attributes;

        return html`
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
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                flex: auto;
                --cooling-color: rgb(var(--rgb-state-climate-cooling));
                --heating-color: rgb(var(--rgb-state-climate-heating));
                --slider-outline-color: transparent;
                --slider-bg-color: rgba(var(--rgb-state-climate-off), 0.2);
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
