import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../../shared/button";
import { isClosing, isFullyClosed, isFullyOpen, isOpening } from "../utils";

@customElement("mushroom-cover-buttons-control")
export class CoverButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    private _onOpenTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "open_cover", {
            entity_id: this.entity.entity_id,
        });
    }

    private _onCloseTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "close_cover", {
            entity_id: this.entity.entity_id,
        });
    }

    private _onStopTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "stop_cover", {
            entity_id: this.entity.entity_id,
        });
    }

    protected render(): TemplateResult {
        return html`
            <mushroom-button
                icon="mdi:arrow-down"
                .disabled=${isFullyClosed(this.entity) ||
                isClosing(this.entity)}
                @click=${this._onCloseTap}
            ></mushroom-button>
            <mushroom-button
                icon="mdi:pause"
                @click=${this._onStopTap}
            ></mushroom-button>
            <mushroom-button
                icon="mdi:arrow-up"
                .disabled=${isFullyOpen(this.entity) || isOpening(this.entity)}
                @click=${this._onOpenTap}
            ></mushroom-button>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                flex-direction: row;
                width: 100%;
            }
            :host *:not(:last-child) {
                margin-right: 12px;
            }
            mushroom-button {
                flex: 1;
            }
        `;
    }
}
