import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../../../shared/button";
import { callService } from "../utils";

@customElement("mushroom-vacuum-locate-control")
export class VacuumLocateControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property() public fill: boolean = false;

    protected render(): TemplateResult {
        const icon = "map-marker";
        const service = "locate";

        return html`
            <div
                class=${classMap({
                    container: true,
                    fill: this.fill,
                })}
            >
                <mushroom-button
                    .icon="mdi:${icon}"
                    @click=${(e) => callService(e, this.hass, this.entity,  service)}
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
