import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../../../shared/button";
import {
    callService,
    isCleaning,
    supportsPause,
    supportsStart,
} from "../utils";

@customElement("mushroom-vacuum-start-pause-control")
export class VacuumStartPauseControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property() public fill: boolean = false;

    protected render(): TemplateResult {
        const playButton = supportsStart(this.entity);
        const pauseButton = supportsStart(this.entity) && supportsPause(this.entity);
        const playPauseButton = !supportsStart(this.entity) && supportsPause(this.entity);

        if (playButton) {
            return html`
                <div
                    class=${classMap({
                        container: true,
                        fill: this.fill,
                    })}
                >
                    <mushroom-button
                        icon="mdi:play"
                        .disabled=${isCleaning(this.entity)}
                        @click=${(e) => callService(e, this.hass, this.entity, "start")}
                    ></mushroom-button>
                </div>
            `;
        }

        if (pauseButton) {
            return html`
                <div
                    class=${classMap({
                        container: true,
                        fill: this.fill,
                    })}
                >
                    <mushroom-button
                        icon="mdi:pause"
                        .disabled=${!isCleaning(this.entity)}
                        @click=${(e) => callService(e, this.hass, this.entity, "pause")}
                    ></mushroom-button>
                </div>
            `;
        }

        if (playPauseButton) {
            return html`
                <div
                    class=${classMap({
                        container: true,
                        fill: this.fill,
                    })}
                >
                    <mushroom-button
                        icon="mdi:play-pause"
                        @click=${(e) => callService(e, this.hass, this.entity, "start_pause")}
                    ></mushroom-button>
                </div>
            `;
        }

        return html``;
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
