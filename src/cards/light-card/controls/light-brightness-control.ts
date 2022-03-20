import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../../shared/slider";
import { getBrightness } from "../utils";

@customElement("mushroom-light-brightness-control")
export class LightBrighnessControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    onChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;
        this.hass.callService("light", "turn_on", {
            entity_id: this.entity.entity_id,
            brightness_pct: value,
        });
    }

    onCurrentChange(e: CustomEvent<{ value?: number }>): void {
        const value = e.detail.value;
        this.dispatchEvent(
            new CustomEvent("current-change", {
                detail: {
                    value,
                },
            })
        );
    }

    protected render(): TemplateResult {
        const state = this.entity.state;

        const brightness = getBrightness(this.entity);

        return html`
            <mushroom-slider
                .value=${brightness}
                .disabled=${state !== "on"}
                .showActive=${true}
                @change=${this.onChange}
                @current-change=${this.onCurrentChange}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --slider-color: rgb(var(--rgb-state-light));
                --slider-outline-color: transparent;
                --slider-bg-color: rgba(var(--rgb-state-light), 0.2);
            }
            mushroom-slider {
                --main-color: var(--slider-color);
                --bg-color: var(--slider-bg-color);
                --main-outline-color: var(--slider-outline-color);
            }
        `;
    }
}
