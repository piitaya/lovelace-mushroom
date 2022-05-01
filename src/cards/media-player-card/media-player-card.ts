import {
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { isActive } from "../../ha/data/entity";
import { MediaPlayerEntity } from "../../ha/data/media-player";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import { MushroomBaseElement } from "../../utils/base-element";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { getLayoutFromConfig, Layout } from "../../utils/layout";
import {
    MEDIA_PLAYER_CARD_EDITOR_NAME,
    MEDIA_PLAYER_CARD_NAME,
    MEDIA_PLAYER_ENTITY_DOMAINS,
} from "./const";
import "./controls/media-player-media-control";
import { isMediaControlVisible } from "./controls/media-player-media-control";
import "./controls/media-player-volume-control";
import { isVolumeControlVisible } from "./controls/media-player-volume-control";
import { MediaPlayerCardConfig } from "./media-player-card-config";
import { computeMediaIcon, computeMediaNameDisplay, computeMediaStateDisplay } from "./utils";

type MediaPlayerCardControl = "media_control" | "volume_control";

const CONTROLS_ICONS: Record<MediaPlayerCardControl, string> = {
    media_control: "mdi:play-pause",
    volume_control: "mdi:volume-high",
};

registerCustomCard({
    type: MEDIA_PLAYER_CARD_NAME,
    name: "Mushroom Media Card",
    description: "Card for media player entity",
});

@customElement(MEDIA_PLAYER_CARD_NAME)
export class MediaPlayerCard extends MushroomBaseElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./media-player-card-editor");
        return document.createElement(MEDIA_PLAYER_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<MediaPlayerCardConfig> {
        const entities = Object.keys(hass.states);
        const mediaPlayers = entities.filter((e) =>
            MEDIA_PLAYER_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
        return {
            type: `custom:${MEDIA_PLAYER_CARD_NAME}`,
            entity: mediaPlayers[0],
        };
    }

    @state() private _config?: MediaPlayerCardConfig;

    @state() private _activeControl?: MediaPlayerCardControl;

    @state() private _controls: MediaPlayerCardControl[] = [];

    _onControlTap(ctrl, e): void {
        e.stopPropagation();
        this._activeControl = ctrl;
    }

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
            ...config,
        };
        this.updateControls();
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (this.hass && changedProperties.has("hass")) {
            this.updateControls();
        }
    }

    updateControls() {
        if (!this._config || !this.hass || !this._config.entity) return;

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id] as MediaPlayerEntity;

        if (!entity) return;

        const controls: MediaPlayerCardControl[] = [];
        if (!this._config.collapsible_controls || isActive(entity)) {
            if (isMediaControlVisible(entity, this._config?.media_controls)) {
                controls.push("media_control");
            }
            if (isVolumeControlVisible(entity, this._config.volume_controls)) {
                controls.push("volume_control");
            }
        }

        this._controls = controls;
        const isActiveControlSupported = this._activeControl
            ? controls.includes(this._activeControl)
            : false;
        this._activeControl = isActiveControlSupported ? this._activeControl : controls[0];
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id] as MediaPlayerEntity;

        const icon = computeMediaIcon(this._config, entity);
        const layout = getLayoutFromConfig(this._config);

        let nameDisplay = computeMediaNameDisplay(this._config, entity);
        let stateDisplay = computeMediaStateDisplay(this._config, entity, this.hass);

        const rtl = computeRTL(this.hass);

        const artwork = this._config.use_media_artwork
            ? entity.attributes.entity_picture
            : undefined;

        return html`
            <ha-card class=${classMap({ "fill-container": this._config.fill_container ?? false })}>
                <mushroom-card .layout=${layout} ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .layout=${layout}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        ${artwork
                            ? html`
                                  <mushroom-shape-avatar
                                      slot="icon"
                                      .picture_url=${artwork}
                                  ></mushroom-shape-avatar>
                              `
                            : html`
                                  <mushroom-shape-icon
                                      slot="icon"
                                      .icon=${icon}
                                      .disabled=${!isActive(entity)}
                                  ></mushroom-shape-icon>
                              `}
                        ${entity.state === "unavailable"
                            ? html`
                                  <mushroom-badge-icon
                                      class="unavailable"
                                      slot="badge"
                                      icon="mdi:help"
                                  ></mushroom-badge-icon>
                              `
                            : null}
                        <mushroom-state-info
                            slot="info"
                            .primary=${nameDisplay}
                            .secondary=${stateDisplay}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                    ${this._controls.length > 0
                        ? html`
                              <div class="actions" ?rtl=${rtl}>
                                  ${this.renderActiveControl(entity, layout)}
                                  ${this.renderOtherControls()}
                              </div>
                          `
                        : null}
                </mushroom-card>
            </ha-card>
        `;
    }

    private renderOtherControls(): TemplateResult | null {
        const otherControls = this._controls.filter((control) => control != this._activeControl);

        return html`
            ${otherControls.map(
                (ctrl) => html`
                    <mushroom-button
                        .icon=${CONTROLS_ICONS[ctrl]}
                        @click=${(e) => this._onControlTap(ctrl, e)}
                    />
                `
            )}
        `;
    }

    private renderActiveControl(entity: MediaPlayerEntity, layout: Layout): TemplateResult | null {
        const media_controls = this._config?.media_controls ?? [];
        const volume_controls = this._config?.volume_controls ?? [];

        switch (this._activeControl) {
            case "media_control":
                return html`
                    <mushroom-media-player-media-control
                        .hass=${this.hass}
                        .entity=${entity}
                        .controls=${media_controls}
                        .fill=${layout !== "horizontal"}
                    >
                    </mushroom-media-player-media-control>
                `;
            case "volume_control":
                return html`
                    <mushroom-media-player-volume-control
                        .hass=${this.hass}
                        .entity=${entity}
                        .controls=${volume_controls}
                        .fill=${layout !== "horizontal"}
                    />
                `;
            default:
                return null;
        }
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon {
                    --icon-color: rgb(var(--rgb-state-media-player));
                    --shape-color: rgba(var(--rgb-state-media-player), 0.2);
                }
                mushroom-media-player-media-control,
                mushroom-media-player-volume-control {
                    flex: 1;
                }
            `,
        ];
    }
}
