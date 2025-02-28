import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  computeRTL,
  HomeAssistant,
  isActive,
  isAvailable,
  UpdateEntity,
  updateIsInstalling,
} from "../../../ha";
import "../../../shared/button";
import "../../../shared/button-group";

@customElement("mushroom-update-buttons-control")
export class UpdateButtonsControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: UpdateEntity;

  @property({ type: Boolean }) public fill: boolean = false;

  private _handleInstall(): void {
    this.hass.callService("update", "install", {
      entity_id: this.entity.entity_id,
    });
  }

  private _handleSkip(e: MouseEvent): void {
    e.stopPropagation();
    this.hass.callService("update", "skip", {
      entity_id: this.entity.entity_id,
    });
  }

  private get installDisabled(): boolean {
    if (!isAvailable(this.entity)) return true;
    const skippedVersion =
      this.entity.attributes.latest_version &&
      this.entity.attributes.skipped_version ===
        this.entity.attributes.latest_version;
    return (
      (!isActive(this.entity) && !skippedVersion) ||
      updateIsInstalling(this.entity)
    );
  }

  private get skipDisabled(): boolean {
    if (!isAvailable(this.entity)) return true;
    const skippedVersion =
      this.entity.attributes.latest_version &&
      this.entity.attributes.skipped_version ===
        this.entity.attributes.latest_version;
    return (
      skippedVersion ||
      !isActive(this.entity) ||
      updateIsInstalling(this.entity)
    );
  }

  protected render(): TemplateResult {
    const rtl = computeRTL(this.hass);

    return html`
      <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}>
        <mushroom-button
          .disabled=${this.skipDisabled}
          @click=${this._handleSkip}
        >
          <ha-icon icon="mdi:cancel"></ha-icon>
        </mushroom-button>
        <mushroom-button
          .disabled=${this.installDisabled}
          @click=${this._handleInstall}
        >
          <ha-icon icon="mdi:cellphone-arrow-down"></ha-icon>
        </mushroom-button>
      </mushroom-button-group>
    `;
  }
}
