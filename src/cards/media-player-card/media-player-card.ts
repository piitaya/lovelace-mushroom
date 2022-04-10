import {
    ActionHandlerEvent,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { isActive, isAvailable } from "../../ha/data/entity";
import { MediaPlayerEntity } from "../../ha/data/media-player";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import { MEDIA_PLAYER_CARD_EDITOR_NAME, MEDIA_PLAYER_CARD_NAME } from "./const";
import "./controls/media-player-buttons-control";
import "./controls/media-player-volume-control";
import { MediaPlayerCardConfig } from "./media-player-card-config";
import { computeIcon, getCardName, getStateDisplay, supportsVolumeSet } from "./utils";

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

    private _renderActionsHorizontal(
        buttonsControlEnabled: boolean,
        volumeControleEnabled: boolean,
        entity: MediaPlayerEntity,
        layout: string,
        active: boolean
    ): TemplateResult {
        return html` ${volumeControleEnabled && active
            ? html` <div class="actions">
                  <mushroom-media-player-volume-control
                      .hass=${this.hass}
                      .entity=${entity}
                      .fill=${layout !== "horizontal"}
                  />
              </div>`
            : null}
        ${buttonsControlEnabled
            ? html` <div class="actions">
                  <mushroom-media-player-buttons-control
                      .hass=${this.hass}
                      .entity=${entity}
                      .fill=${layout !== "horizontal"}
                  />
              </div>`
            : null}`;
    }

    private _renderActionsVertical(
        buttonsControlEnabled: boolean,
        volumeControleEnabled: boolean,
        entity: MediaPlayerEntity,
        layout: string,
        active: boolean
    ): TemplateResult {
        return html` ${buttonsControlEnabled
            ? html` <div class="actions">
                  <mushroom-media-player-buttons-control
                      .hass=${this.hass}
                      .entity=${entity}
                      .fill=${layout !== "horizontal"}
                  />
              </div>`
            : null}
        ${volumeControleEnabled && active
            ? html` <div class="actions">
                  <mushroom-media-player-volume-control
                      .hass=${this.hass}
                      .entity=${entity}
                      .fill=${layout !== "horizontal"}
                  />
              </div>`
            : null}`;
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id] as MediaPlayerEntity;

        const icon = computeIcon(this._config, entity);
        const layout = getLayoutFromConfig(this._config);

        const available = isAvailable(entity);
        const active = isActive(entity);

        const buttonsControlEnabled = (available && this._config.show_buttons_control) || false;
        const volumeControleEnabled =
            (available && this._config.show_volume_control && supportsVolumeSet(entity)) || false;
        const backgroundArtEnabled =
            (available && this._config.enable_art_background && entity.attributes.entity_picture) ||
            false;

        let backgroundClassMap = {};
        if (backgroundArtEnabled) {
            // TODO
        }

        let iconStyle = {};

        let nameDisplay = getCardName(this._config, entity);
        let stateDisplay = getStateDisplay(entity, this.hass);

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
                    .icon="${icon}"
                    style=${styleMap(iconStyle)}
                ></mushroom-shape-icon>
                <mushroom-state-info
                    slot="info"
                    .primary=${nameDisplay}
                    .secondary=${stateDisplay}
                ></mushroom-state-info>
            </mushroom-state-item>
            ${layout === "horizontal"
                ? this._renderActionsHorizontal(
                      buttonsControlEnabled,
                      volumeControleEnabled,
                      entity,
                      layout,
                      active
                  )
                : this._renderActionsVertical(
                      buttonsControlEnabled,
                      volumeControleEnabled,
                      entity,
                      layout,
                      active
                  )}
        </mushroom-card>`;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                ha-card {
                    background: "center / cover url("entity.attributes.entity_picture") rgba(0, 0, 0, 0.15);",
                }

                mushroom-state-item {
                    cursor: pointer;
                }

                mushroom-media-player-buttons-control,
                mushroom-media-player-volume-control {
                    flex: 1;
                }
            `,
        ];
    }
}
