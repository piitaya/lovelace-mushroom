import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../../shared/slider";
import { getPosition, isActive } from "../utils";

@customElement("mushroom-cover-position-control")
export class CoverPositionControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    private _onSliderChange(e: CustomEvent): void {
        const value = Number((e.target as any).value);
        if (isNaN(value)) return;

        this.hass.callService("cover", "set_cover_position", {
            entity_id: this.entity.entity_id,
            position: value,
        });
    }

    protected render(): TemplateResult {
        const position = getPosition(this.entity);

        return html`
            <mushroom-slider
                .value=${position}
                .disabled=${!isActive(this.entity)}
                .showActive=${true}
                @change=${this._onSliderChange}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --rgb-color: 61, 90, 254;
            }
            mushroom-slider {
                --main-color: rgba(var(--rgb-color), 1);
                --bg-color: rgba(var(--rgb-color), 0.2);
            }
        `;
    }
}
