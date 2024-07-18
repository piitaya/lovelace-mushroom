import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  computeRTL,
  HomeAssistant,
  isActive,
  isAvailable,
  isOff,
  MEDIA_PLAYER_SUPPORT_VOLUME_BUTTONS,
  MEDIA_PLAYER_SUPPORT_VOLUME_MUTE,
  MEDIA_PLAYER_SUPPORT_VOLUME_SET,
  MediaPlayerEntity,
  supportsFeature,
} from "../../../ha";
import { MediaPlayerVolumeControl } from "../media-player-card-config";
import { getVolumeLevel, handleMediaControlClick } from "../utils";

export const isVolumeControlVisible = (
  entity: MediaPlayerEntity,
  controls?: MediaPlayerVolumeControl[]
) =>
  (controls?.includes("volume_buttons") &&
    supportsFeature(entity, MEDIA_PLAYER_SUPPORT_VOLUME_BUTTONS)) ||
  (controls?.includes("volume_mute") &&
    supportsFeature(entity, MEDIA_PLAYER_SUPPORT_VOLUME_MUTE)) ||
  (controls?.includes("volume_set") &&
    supportsFeature(entity, MEDIA_PLAYER_SUPPORT_VOLUME_SET));

@customElement("mushroom-media-player-volume-control")
export class MediaPlayerVolumeControls extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: MediaPlayerEntity;

  @property({ type: Boolean }) public fill: boolean = false;

  @property({ attribute: false }) public controls!: MediaPlayerVolumeControl[];

  private handleSliderChange(e: CustomEvent<{ value: number }>): void {
    const value = e.detail.value;
    this.hass.callService("media_player", "volume_set", {
      entity_id: this.entity.entity_id,
      volume_level: value / 100,
    });
  }

  handleSliderCurrentChange(e: CustomEvent<{ value?: number }>): void {
    let value = e.detail.value;
    this.dispatchEvent(
      new CustomEvent("current-change", {
        detail: {
          value,
        },
      })
    );
  }

  private handleClick(e: MouseEvent): void {
    e.stopPropagation();
    const action = (e.target! as any).action as string;
    handleMediaControlClick(this.hass, this.entity, action!);
  }

  protected render() {
    if (!this.entity) return nothing;

    const value = getVolumeLevel(this.entity);

    const rtl = computeRTL(this.hass);

    const displayVolumeSet =
      this.controls?.includes("volume_set") &&
      supportsFeature(this.entity, MEDIA_PLAYER_SUPPORT_VOLUME_SET);

    const displayVolumeMute =
      this.controls?.includes("volume_mute") &&
      supportsFeature(this.entity, MEDIA_PLAYER_SUPPORT_VOLUME_MUTE);

    const displayVolumeButtons =
      this.controls?.includes("volume_buttons") &&
      supportsFeature(this.entity, MEDIA_PLAYER_SUPPORT_VOLUME_BUTTONS);

    return html`
      <mushroom-button-group
        .fill=${this.fill && !displayVolumeSet}
        ?rtl=${rtl}
      >
        ${displayVolumeSet
          ? html` <mushroom-slider
              .value=${value}
              .disabled=${!isAvailable(this.entity) || isOff(this.entity)}
              .inactive=${!isActive(this.entity)}
              .showActive=${true}
              .min=${0}
              .max=${100}
              @change=${this.handleSliderChange}
              @current-change=${this.handleSliderCurrentChange}
            />`
          : nothing}
        ${displayVolumeMute
          ? html`
              <mushroom-button
                .action=${"volume_mute"}
                .disabled=${!isAvailable(this.entity) || isOff(this.entity)}
                @click=${this.handleClick}
              >
                <ha-icon
                  .icon=${this.entity.attributes.is_volume_muted
                    ? "mdi:volume-off"
                    : "mdi:volume-high"}
                ></ha-icon>
              </mushroom-button>
            `
          : undefined}
        ${displayVolumeButtons
          ? html`
              <mushroom-button
                .action=${"volume_down"}
                .disabled=${!isAvailable(this.entity) || isOff(this.entity)}
                @click=${this.handleClick}
              >
                <ha-icon icon="mdi:volume-minus"></ha-icon
              ></mushroom-button>
            `
          : undefined}
        ${displayVolumeButtons
          ? html`
              <mushroom-button
                .action=${"volume_up"}
                .disabled=${!isAvailable(this.entity) || isOff(this.entity)}
                @click=${this.handleClick}
              >
                <ha-icon icon="mdi:volume-plus"></ha-icon
              ></mushroom-button>
            `
          : undefined}
      </mushroom-button-group>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      mushroom-slider {
        flex: 1;
        --main-color: rgb(var(--rgb-state-media-player));
        --bg-color: rgba(var(--rgb-state-media-player), 0.2);
      }
    `;
  }
}
