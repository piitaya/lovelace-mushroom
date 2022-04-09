import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isActive, isAvailable } from "../../../utils/entity";

@customElement("mushroom-media-volume-control")
export class MediaVolumeControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    _percent = 0;

    onChange(e: CustomEvent<{ value: number }>): void {
        const value = e.detail.value;
        this._percent = value;
    }

    protected render(): TemplateResult {
        return html`
            <mushroom-slider
                .value=${this._percent}
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
