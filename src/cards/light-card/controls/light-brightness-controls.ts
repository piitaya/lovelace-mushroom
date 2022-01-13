import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../../shared/slider";
import { getBrightness } from "../utils";

@customElement("mushroom-light-brightness-controls")
export class LightBrighnessControls extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    onChange(e: CustomEvent): void {
        const value = Number((e.target as any).value);
        if (isNaN(value)) return;

        this.hass.callService("light", "turn_on", {
            entity_id: this.entity.entity_id,
            brightness_pct: value,
        });
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
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --rgb-color: 255, 145, 1;
            }
            mushroom-slider {
                --main-color: rgba(var(--rgb-color), 1);
                --bg-color: rgba(var(--rgb-color), 0.2);
            }
        `;
    }
}
