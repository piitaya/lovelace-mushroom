import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { MEDIA_PLAYER_STATE_PLAYING } from "../../../ha/data/media-player";
import {
    callService,
    supportsNext,
    supportsPause,
    supportsPlay,
    supportsPrevious,
} from "../utils";

@customElement("mushroom-media-player-buttons-control")
export class MediaPlayerButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property() public fill: boolean = false;

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    container: true,
                    fill: this.fill,
                })}
            >
                ${supportsPrevious(this.entity)
                    ? this._generateButton("mdi:skip-previous", "media_previous_track")
                    : null}
                ${supportsPlay(this.entity) && supportsPause(this.entity)
                    ? this._generatePlayPauseButton()
                    : null}
                ${supportsNext(this.entity)
                    ? this._generateButton("mdi:skip-next", "media_next_track")
                    : null}
            </div>
        `;
    }

    _generateButton(iconName: string, serviceName: string): TemplateResult {
        return html`
            <mushroom-button
                .icon=${iconName}
                @click=${(e) => callService(e, this.hass, this.entity, serviceName)}
            ></mushroom-button>
        `;
    }

    _generatePlayPauseButton(): TemplateResult {
        const serviceName = "media_play_pause";

        if (this.entity.state == MEDIA_PLAYER_STATE_PLAYING) {
            return html`
                <mushroom-button
                    icon="mdi:pause"
                    @click=${(e) => callService(e, this.hass, this.entity, serviceName)}
                ></mushroom-button>
            `;
        } else {
            return html`
                <mushroom-button
                    icon="mdi:play"
                    @click=${(e) => callService(e, this.hass, this.entity, serviceName)}
                ></mushroom-button>
            `;
        }
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
