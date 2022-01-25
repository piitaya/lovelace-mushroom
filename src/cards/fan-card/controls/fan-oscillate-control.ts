import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../../../shared/slider";
import { isActive, isOscillating } from "../utils";

@customElement("mushroom-fan-oscillate-control")
export class FanPercentageControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    private _onTap(e: MouseEvent): void {
        e.stopPropagation();
        const oscillating = isOscillating(this.entity);

        this.hass.callService("fan", "oscillate", {
            entity_id: this.entity.entity_id,
            oscillating: !oscillating,
        });
    }

    protected render(): TemplateResult {
        const oscillating = isOscillating(this.entity);
        const active = isActive(this.entity);

        return html`
            <mushroom-button
                class=${classMap({ active: oscillating })}
                .icon=${"mdi:sync"}
                @click=${this._onTap}
                .disabled=${!active}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                --rgb-color: 61, 90, 254;
            }
            mushroom-button.active {
                --icon-color: white;
                --bg-color: rgba(var(--rgb-color), 1);
            }
        `;
    }
}
