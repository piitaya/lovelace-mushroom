import {
    ActionHandlerEvent,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { isActive } from "../../ha/data/entity";
import { MediaPlayerEntity } from "../../ha/data/media-player";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { getLayoutFromConfig } from "../../utils/layout";
import { MEDIA_PLAYER_CARD_EDITOR_NAME, MEDIA_PLAYER_CARD_NAME } from "./const";
import "./controls/media-player-buttons-control";
import "./controls/media-player-volume-control";
import { MediaPlayerCardConfig } from "./media-player-card-config";
import {
    computeIcon,
    computeSupportMediaPlayerControls,
    getCardName,
    getStateDisplay,
    supportsVolumeSet,
} from "./utils";

type MediaPlayerCardControl = "buttons_control" | "volume_control";

const CONTROLS_ICONS: Record<MediaPlayerCardControl, string> = {
    buttons_control: "mdi:gamepad",
    volume_control: "mdi:volume-high",
};

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
            double_tap_action: {
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

        if (
            this._config.show_buttons_control &&
            computeSupportMediaPlayerControls(entity)
        ) {
            controls.push("buttons_control");
        }
        if (this._config.show_volume_control && supportsVolumeSet(entity)) {
            controls.push("volume_control");
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

        const icon = computeIcon(this._config, entity);
        const layout = getLayoutFromConfig(this._config);
        const active = isActive(entity);

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
                      <div class="actions">
                          ${this.renderActiveControl(entity)} ${this.renderOtherControls()}
                      </div>
                  `
                : null}
        </mushroom-card>`;
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

    private renderActiveControl(entity: MediaPlayerEntity): TemplateResult | null {
        switch (this._activeControl) {
            case "buttons_control":
                return html`
                    <mushroom-media-player-buttons-control
                        .hass=${this.hass}
                        .entity=${entity}
                        .fill=${this._config?.layout !== "horizontal"}
                    />
                `;
            case "volume_control":
                return html`
                    <mushroom-media-player-volume-control .hass=${this.hass} .entity="${entity}" />
                `;
            default:
                return null;
        }
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
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
