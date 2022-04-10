import {
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { isActive, isAvailable } from "../../ha/data/entity";
import { ATTR_APP_NAME, ATTR_MEDIA_ARTIST, ATTR_MEDIA_TITLE, MEDIA_PLAYER_STATE_PLAYING } from "../../ha/data/media-player";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import {
    MEDIA_PLAYER_CARD_EDITOR_NAME,
    MEDIA_PLAYER_CARD_NAME,
} from "./const";
import "./controls/media-player-buttons-control";
import "./controls/media-player-volume-control";
import { MediaPlayerCardConfig } from "./media-player-card-config";
import { supportsVolumeSet } from "./utils";

registerCustomCard({
    type: MEDIA_PLAYER_CARD_NAME,
    name: "Mushroom Media Card",
    description: "Card for media player entity",
});

@customElement(MEDIA_PLAYER_CARD_NAME)
export class MediaPlayerCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./media-player-card-editor");
        return document.createElement(MEDIA_PLAYER_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: MediaPlayerCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: MediaPlayerCardConfig): void {
        this._config = {
            tap_action: {
                action: "more-info",
            },
            hold_action: {
                action: "more-info",
            },
            double_tap_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const icon = this._config.icon || stateIcon(entity);
        const layout = getLayoutFromConfig(this._config);

        const available = isAvailable(entity);
        const active = isActive(entity);
        const buttonsControlEnabled = (available && this._config.show_buttons_control) || false;
        const volumeControleEnabled =
            (available && this._config.show_volume_control && supportsVolumeSet(entity)) || false;
        console.log(
            "Control " +
                entity_id +
                "Buttons " +
                buttonsControlEnabled +
                " Volume " +
                volumeControleEnabled
        );
        let name = this._config.name || entity.attributes.friendly_name;
        let stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);
        let iconStyle = {};

        if (entity.state == MEDIA_PLAYER_STATE_PLAYING) {
            name = entity.attributes[ATTR_MEDIA_TITLE];
            stateDisplay = entity.attributes[ATTR_MEDIA_ARTIST] || entity.attributes[ATTR_APP_NAME];
        }

        return html`<mushroom-card .layout=${layout}>
            <mushroom-state-item
                .layout=${layout}
                @action=${this._handleAction}
                .actionHandler=${actionHandler({
                    hasHold: hasAction(this._config.hold_action),
                    hasDoubleClick: hasAction(this._config.double_tap_action),
                })}
            >
                <mushroom-shape-icon
                    slot="icon"
                    .disabled=${!active}
                    .icon=${icon}
                    style=${styleMap(iconStyle)}
                ></mushroom-shape-icon>
                <mushroom-state-info
                    slot="info"
                    .primary=${name}
                    .secondary=${stateDisplay}
                ></mushroom-state-info>
            </mushroom-state-item>
            ${buttonsControlEnabled
                ? html` <div class="actions">
                      <mushroom-media-player-buttons-control
                          .hass=${this.hass}
                          .entity=${entity}
                          .fill=${layout !== "horizontal"}
                      />
                  </div>`
                : null}
            ${volumeControleEnabled
                ? html` <div class="actions">
                      <mushroom-media-player-volume-control
                          .hass=${this.hass}
                          .entity=${entity}
                          .fill=${layout !== "horizontal"}
                      />
                  </div>`
                : null}
        </mushroom-card>`;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
            `,
        ];
    }
}
