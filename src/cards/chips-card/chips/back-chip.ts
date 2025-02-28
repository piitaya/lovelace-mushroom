import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { actionHandler, computeRTL, HomeAssistant } from "../../../ha";
import {
  computeChipComponentName,
  computeChipEditorComponentName,
} from "../../../utils/lovelace/chip/chip-element";
import {
  BackChipConfig,
  LovelaceChip,
} from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";

export const DEFAULT_BACK_ICON = "mdi:arrow-left";

@customElement(computeChipComponentName("back"))
export class BackChip extends LitElement implements LovelaceChip {
  public static async getConfigElement(): Promise<LovelaceChipEditor> {
    await import("./back-chip-editor");
    return document.createElement(
      computeChipEditorComponentName("back")
    ) as LovelaceChipEditor;
  }

  public static async getStubConfig(
    _hass: HomeAssistant
  ): Promise<BackChipConfig> {
    return {
      type: `back`,
    };
  }

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: BackChipConfig;

  public setConfig(config: BackChipConfig): void {
    this._config = config;
  }

  private _handleAction() {
    window.history.back();
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const icon = this._config.icon || DEFAULT_BACK_ICON;

    const rtl = computeRTL(this.hass);

    return html`
      <mushroom-chip
        ?rtl=${rtl}
        @action=${this._handleAction}
        .actionHandler=${actionHandler()}
      >
        <ha-state-icon .hass=${this.hass} .icon=${icon}></ha-state-icon>
      </mushroom-chip>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      mushroom-chip {
        cursor: pointer;
      }
    `;
  }
}
