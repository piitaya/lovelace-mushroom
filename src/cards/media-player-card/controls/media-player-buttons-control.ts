import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { MEDIA_PLAYER_STATE_PLAYING } from "../../../ha/data/media-player";
import { callService, supportsNext, supportsPause, supportsPlay, supportsPrevious } from "../utils";

@customElement("mushroom-media-player-buttons-control")
export class MediaPlayerButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property() public fill: boolean = false;

    @property() public artBackgroundEnabled: boolean = false;

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    container: true,
                    fill: this.fill,
                })}
            >
                ${supportsPrevious(this.entity)
                    ? this._generateButton("skip-previous", "media_previous_track")
                    : null}
                ${supportsPlay(this.entity) && supportsPause(this.entity)
                    ? this._generatePlayPauseButton()
                    : null}
                ${supportsNext(this.entity)
                    ? this._generateButton("skip-next", "media_next_track")
                    : null}
            </div>
        `;
    }

    _generateButton(iconName: string, serviceName: string): TemplateResult {
        return html`
            <mushroom-button
                .icon="mdi:${iconName}"
                class=${classMap({
                    darkest: this.artBackgroundEnabled,
                })}
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
                    class=${classMap({
                        darkest: this.artBackgroundEnabled,
                    })}
                    @click=${(e) => callService(e, this.hass, this.entity, serviceName)}
                ></mushroom-button>
            `;
        } else {
            return html`
                <mushroom-button
                    icon="mdi:play"
                    class=${classMap({
                        darkest: this.artBackgroundEnabled,
                    })}
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
            mushroom-button.darkest {
                --bg-color: rgba(0, 0, 0, 0.8);
            }
        `;
    }
}
