import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  actionHandler,
  ActionHandlerEvent,
  computeRTL,
  handleAction,
  hasAction,
  HomeAssistant,
} from "../../../ha";
import { computeRgbColor } from "../../../utils/colors";
import {
  computeChipComponentName,
  computeChipEditorComponentName,
} from "../../../utils/lovelace/chip/chip-element";
import {
  ActionChipConfig,
  LovelaceChip,
} from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";

export const DEFAULT_ACTION_ICON = "mdi:flash";

@customElement(computeChipComponentName("action"))
export class ActionChip extends LitElement implements LovelaceChip {
  public static async getConfigElement(): Promise<LovelaceChipEditor> {
    await import("./action-chip-editor");
    return document.createElement(
      computeChipEditorComponentName("action")
    ) as LovelaceChipEditor;
  }

  public static async getStubConfig(
    _hass: HomeAssistant
  ): Promise<ActionChipConfig> {
    return {
      type: `action`,
    };
  }

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: ActionChipConfig;

  public setConfig(config: ActionChipConfig): void {
    this._config = config;
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.hass!, this._config!, ev.detail.action!);
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const icon = this._config.icon || DEFAULT_ACTION_ICON;
    const iconColor = this._config.icon_color;

    const iconStyle = {};
    if (iconColor) {
      const iconRgbColor = computeRgbColor(iconColor);
      iconStyle["--color"] = `rgb(${iconRgbColor})`;
    }

    const rtl = computeRTL(this.hass);

    return html`
      <mushroom-chip
        ?rtl=${rtl}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config.hold_action),
          hasDoubleClick: hasAction(this._config.double_tap_action),
        })}
      >
        <ha-state-icon
          .hass=${this.hass}
          .icon=${icon}
          style=${styleMap(iconStyle)}
        ></ha-state-icon>
      </mushroom-chip>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      mushroom-chip {
        cursor: pointer;
      }
      ha-state-icon {
        color: var(--color);
      }
    `;
  }
}
