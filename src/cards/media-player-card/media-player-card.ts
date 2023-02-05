import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import {
	actionHandler,
	ActionHandlerEvent,
	computeRTL, getEntityPicture,
	handleAction,
	hasAction,
	HomeAssistant,
	isActive,
	LovelaceCard,
	LovelaceCardEditor,
	MediaPlayerEntity, OFF, UNAVAILABLE, UNKNOWN,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { computeEntityPicture } from "../../utils/info";
import { Layout } from "../../utils/layout";
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
import {
	computeMediaIcon,
	computeMediaNameDisplay,
	computeMediaStateDisplay,
	getVolumeLevel,
} from "./utils";
import { styleMap } from "lit/directives/style-map.js";

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
export class MediaPlayerCard extends MushroomBaseCard implements LovelaceCard {
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
		this.updateVolume();
	}

	protected updated(changedProperties: PropertyValues) {
		super.updated(changedProperties);
		if (this.hass && changedProperties.has("hass")) {
			this.updateControls();
			this.updateVolume();
		}
	}

	@state()
	private volume?: number;

	updateVolume() {
		this.volume = undefined;
		if (!this._config || !this.hass || !this._config.entity) return;

		const entity_id = this._config.entity;
		const entity = this.hass.states[entity_id] as MediaPlayerEntity;

		if (!entity) return;
		const volume = getVolumeLevel(entity);
		this.volume = volume != null ? Math.round(volume) : volume;
	}

	private onCurrentVolumeChange(e: CustomEvent<{ value?: number }>): void {
		if (e.detail.value != null) {
			this.volume = e.detail.value;
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
		const nameDisplay = computeMediaNameDisplay(this._config, entity);
		const stateDisplay = computeMediaStateDisplay(this._config, entity, this.hass);
		const appearance = computeAppearance(this._config);
		const picture = computeEntityPicture(entity, appearance.icon_type);

		const stateValue =
			this.volume != null && this._config.show_volume_level
				? `${stateDisplay} - ${this.volume}%`
				: stateDisplay;

		const rtl = computeRTL(this.hass);

		const artwork = this.renderArtwork(entity);
		const cardStyleMap = {};
		if (!!artwork && this._config?.artwork == "full_cover") {
			cardStyleMap["padding-top"] = "calc(100% - 8 * var(--spacing))";
		}

		return html`
            <ha-card class=${classMap({ "fill-container": appearance.fill_container })}>
                ${artwork}
                <mushroom-card .appearance=${appearance} ?rtl=${rtl} style="${styleMap(cardStyleMap)}">
                    <mushroom-state-item
                            ?rtl=${rtl}
                            .appearance=${appearance}
                            @action=${this._handleAction}
                            .actionHandler=${actionHandler({
                                hasHold: hasAction(this._config.hold_action),
                                hasDoubleClick: hasAction(this._config.double_tap_action),
                            })}
                    >
                        ${picture ? this.renderPicture(picture) : this.renderIcon(entity, icon)}
                        ${this.renderBadge(entity)}
                        ${this.renderStateInfo(entity, appearance, nameDisplay, stateValue)};
                    </mushroom-state-item>
                    ${this._controls.length > 0
                            ? html`
                                <div class="actions" ?rtl=${rtl}>
                                    ${this.renderActiveControl(entity, appearance.layout)}
                                    ${this.renderOtherControls()}
                                </div>
                            `
                            : null}
                </mushroom-card>
            </ha-card>
		`;
	}

	private renderArtwork(entity: MediaPlayerEntity): TemplateResult | null {
		if (!this._config?.artwork || this._config.artwork === "none" || [UNAVAILABLE, UNKNOWN, OFF].includes(entity.state)) {
			return null;
		}

		const entityPicture = getEntityPicture(entity);
		if (!entityPicture) {
			return null;
		}

		return html`<img class="artwork" src="${entityPicture}" alt=""/>`;
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
                            @current-change=${this.onCurrentVolumeChange}
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
				.artwork {
   					border-radius: var(--ha-card-border-radius, 12px);
					height: 100%;
					width: 100%;
					position: absolute;
					object-fit: cover;
					margin: calc(-1 * var(--spacing));
					filter: var(--media-player-artwork-filter, brightness(30%));
				}
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-card {
                	z-index: 1;
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
