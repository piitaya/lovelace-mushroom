import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  actionHandler,
  computeRTL,
  fireEvent,
  HomeAssistant,
} from "../../../ha";
import {
  computeChipComponentName,
  computeChipEditorComponentName,
} from "../../../utils/lovelace/chip/chip-element";
import {
  LovelaceChip,
  QuickBarChipConfig,
} from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";

export const DEFAULT_QUICKBAR_ICON = "mdi:magnify";

export const enum QuickBarMode {
  Command = "command",
  Device = "device",
  Entity = "entity",
}

export interface QuickBarParams {
  entityFilter?: string;
  mode?: QuickBarMode;
  hint?: string;
}

@customElement(computeChipComponentName("quickbar"))
export class QuickBarChip extends LitElement implements LovelaceChip {
  public static async getConfigElement(): Promise<LovelaceChipEditor> {
    await import("./quickbar-chip-editor");
    return document.createElement(
      computeChipEditorComponentName("quickbar")
    ) as LovelaceChipEditor;
  }

  public static async getStubConfig(
    _hass: HomeAssistant
  ): Promise<QuickBarChipConfig> {
    return {
      type: `quickbar`,
    };
  }

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: QuickBarChipConfig;

  public setConfig(config: QuickBarChipConfig): void {
    this._config = config;
  }

  private _handleAction() {
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      composed: true,
      key: "e"
    });
    this.dispatchEvent(event);
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const icon = this._config.icon || DEFAULT_QUICKBAR_ICON;

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
