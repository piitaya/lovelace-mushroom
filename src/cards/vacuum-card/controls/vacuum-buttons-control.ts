import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../../../shared/button";
import { UNAVAILABLE } from "../../../utils/entity";
import { computeStartStopIcon } from "../../../utils/icons/vacuum-icon";
import {
    isCleaning,
    isStopped,
} from "../utils";

@customElement("mushroom-vacuum-buttons-control")
export class VacuumButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property() public fill: boolean = false;

    private _onStartStopTap(e: MouseEvent): void {
        e.stopPropagation(); 
        if (isCleaning(this.entity)) {
            this.hass.callService("vacuum", "stop", {
                entity_id: this.entity.entity_id,
            });
        } else {
            this.hass.callService("vacuum", "start", {
                entity_id: this.entity.entity_id,
            });
        }
    }

    private _onReturnToBase(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("vacuum", "return_to_base", {
            entity_id: this.entity.entity_id,
        });
    }

    private _onLocate(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("vacuum", "locate", {
            entity_id: this.entity.entity_id,
        });
    }

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    container: true,
                    fill: this.fill,
                })}
            >
                <mushroom-button
                    .icon=${computeStartStopIcon(this.entity.state)}
                    @click=${this._onStartStopTap}
                ></mushroom-button>

                <mushroom-button
                    icon="mdi:home-map-marker"
                    @click=${this._onReturnToBase}
                ></mushroom-button>

                <mushroom-button
                    icon="mdi:map-marker"
                    @click=${this._onLocate}
                ></mushroom-button>
            </div>
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
                margin-right: var(--spacing);
            }
            .container {
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
            }
            .container.fill mushroom-button {
                flex: 1;
            }
        `;
    }
}
