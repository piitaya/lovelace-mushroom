import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  computeRTL,
  CoverEntity,
  COVER_SUPPORT_CLOSE,
  COVER_SUPPORT_OPEN,
  COVER_SUPPORT_STOP,
  HomeAssistant,
  isAvailable,
  isClosing,
  isFullyClosed,
  isFullyOpen,
  isOpening,
  supportsFeature,
} from "../../../ha";
import "../../../shared/button";
import "../../../shared/button-group";
import {
  computeCloseIcon,
  computeOpenIcon,
} from "../../../utils/icons/cover-icon";

@customElement("mushroom-cover-buttons-control")
export class CoverButtonsControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: CoverEntity;

  @property() public fill: boolean = false;

  private _onOpenTap(e: MouseEvent): void {
    e.stopPropagation();
    this.hass.callService("cover", "open_cover", {
      entity_id: this.entity.entity_id,
    });
  }

  private _onCloseTap(e: MouseEvent): void {
    e.stopPropagation();
    this.hass.callService("cover", "close_cover", {
      entity_id: this.entity.entity_id,
    });
  }

  private _onStopTap(e: MouseEvent): void {
    e.stopPropagation();
    this.hass.callService("cover", "stop_cover", {
      entity_id: this.entity.entity_id,
    });
  }

  private get openDisabled(): boolean {
    const assumedState = this.entity.attributes.assumed_state === true;
    return (
      (isFullyOpen(this.entity) || isOpening(this.entity)) && !assumedState
    );
  }

  private get closedDisabled(): boolean {
    const assumedState = this.entity.attributes.assumed_state === true;
    return (
      (isFullyClosed(this.entity) || isClosing(this.entity)) && !assumedState
    );
  }

  protected render(): TemplateResult {
    const rtl = computeRTL(this.hass);

    return html`
      <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}>
        ${supportsFeature(this.entity, COVER_SUPPORT_OPEN)
          ? html`
              <mushroom-button
                .disabled=${!isAvailable(this.entity) || this.openDisabled}
                @click=${this._onOpenTap}
              >
                <ha-icon .icon=${computeOpenIcon(this.entity)}></ha-icon>
              </mushroom-button>
            `
          : undefined}
        ${supportsFeature(this.entity, COVER_SUPPORT_STOP)
          ? html`
              <mushroom-button
                .disabled=${!isAvailable(this.entity)}
                @click=${this._onStopTap}
              >
                <ha-icon icon="mdi:stop"></ha-icon>
              </mushroom-button>
            `
          : undefined}
        ${supportsFeature(this.entity, COVER_SUPPORT_CLOSE)
          ? html`
              <mushroom-button
                .disabled=${!isAvailable(this.entity) || this.closedDisabled}
                @click=${this._onCloseTap}
              >
                <ha-icon .icon=${computeCloseIcon(this.entity)}></ha-icon>
              </mushroom-button>
            `
          : undefined}
      </mushroom-button-group>
    `;
  }
}
