import {
    computeStateDisplay,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/state-item";
import "../../shared/button";
import { registerCustomCard } from "../../utils/custom-cards";
import { COVER_CARD_EDITOR_NAME, COVER_CARD_NAME } from "./const";
import "./cover-card-editor";
import { HassEntity } from "home-assistant-js-websocket";

function isFullyOpen(stateObj: HassEntity) {
    if (stateObj.attributes.current_position !== undefined) {
        return stateObj.attributes.current_position === 100;
    }
    return stateObj.state === "open";
}

function isFullyClosed(stateObj: HassEntity) {
    if (stateObj.attributes.current_position !== undefined) {
        return stateObj.attributes.current_position === 0;
    }
    return stateObj.state === "closed";
}

function isOpening(stateObj: HassEntity) {
    return stateObj.state === "opening";
}

function isClosing(stateObj: HassEntity) {
    return stateObj.state === "closing";
}

export interface CoverCardConfig extends LovelaceCardConfig {
    entity: string;
    icon?: string;
    name?: string;
    show_buttons_control?: false;
}

registerCustomCard({
    type: COVER_CARD_NAME,
    name: "Mushroom Cover Card",
    description: "Card for cover entity",
});

@customElement(COVER_CARD_NAME)
export class CoverCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(
            COVER_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<CoverCardConfig> {
        const entities = Object.keys(hass.states);
        const covers = entities.filter(
            (e) => e.substr(0, e.indexOf(".")) === "cover"
        );
        return {
            type: `custom:${COVER_CARD_NAME}`,
            entity: covers[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: CoverCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: CoverCardConfig): void {
        this._config = config;
    }

    private _onOpenTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "open_cover", {
            entity_id: this._config?.entity,
        });
    }

    private _onCloseTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "close_cover", {
            entity_id: this._config?.entity,
        });
    }

    private _onStopTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "stop_cover", {
            entity_id: this._config?.entity,
        });
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        const entity = this._config.entity;
        const stateObj = this.hass.states[entity];

        const name = this._config.name ?? stateObj.attributes.friendly_name;
        const icon = this._config.icon ?? stateIcon(stateObj);

        const state = stateObj.state;

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            stateObj,
            this.hass.locale
        );

        return html`<ha-card>
            <mushroom-state-item
                .icon=${icon}
                .name=${name}
                .value=${stateDisplay}
                .active=${state === "open" || state === "opening"}
            ></mushroom-state-item>
            ${this._config?.show_buttons_control
                ? html`<div class="actions">
                      <mushroom-button
                          icon="mdi:arrow-down"
                          .disabled=${isFullyClosed(stateObj) ||
                          isClosing(stateObj)}
                          @click=${this._onCloseTap}
                      ></mushroom-button>
                      <mushroom-button
                          icon="mdi:pause"
                          @click=${this._onStopTap}
                      ></mushroom-button>
                      <mushroom-button
                          icon="mdi:arrow-up"
                          .disabled=${isFullyOpen(stateObj) ||
                          isOpening(stateObj)}
                          @click=${this._onOpenTap}
                      ></mushroom-button>
                  </div>`
                : null}
        </ha-card>`;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --rgb-color: 61, 90, 254;
            }
            ha-card {
                display: flex;
                flex-direction: column;
                padding: 12px;
            }
            ha-card > *:not(:last-child) {
                margin-bottom: 12px;
            }
            mushroom-state-item {
                --icon-main-color: rgba(var(--rgb-color), 1);
                --icon-shape-color: rgba(var(--rgb-color), 0.2);
            }
            .actions {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
            }
            .actions *:not(:last-child) {
                margin-right: 12px;
            }
            .actions mushroom-button {
                flex: 1;
            }
        `;
    }
}
