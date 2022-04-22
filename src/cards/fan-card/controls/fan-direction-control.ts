import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isActive } from "../../../ha/data/entity";
import "../../../shared/slider";

@customElement("mushroom-fan-direction-control")
export class FanPercentageControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    private _onTap(e: MouseEvent): void {
        e.stopPropagation();
        const direction = this.entity.attributes.direction == "forward" ? "reverse" : "forward";

        this.hass.callService("fan", "set_direction", {
            entity_id: this.entity.entity_id,
            direction: direction,
        });
    }

    protected render(): TemplateResult {
        const direction = this.entity.attributes.direction;
        const active = isActive(this.entity);

        return html`
            <mushroom-button
                slot="icon"
                .icon=${direction === "forward" ? "mdi:reload" : "mdi:restore"}
                @click=${this._onTap}
                .disabled=${!active}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
            }
        `;
    }
}
