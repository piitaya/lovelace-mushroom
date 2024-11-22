import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
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
import { animation } from "../../../utils/entity-styles";
import { computeInfoDisplay } from "../../../utils/info";
import {
  computeChipComponentName,
  computeChipEditorComponentName,
} from "../../../utils/lovelace/chip/chip-element";
import {
  AlarmControlPanelChipConfig,
  EntityChipConfig,
  LovelaceChip,
} from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { ALARM_CONTROl_PANEL_ENTITY_DOMAINS } from "../../alarm-control-panel-card/const";
import {
  getStateColor,
  shouldPulse,
} from "../../alarm-control-panel-card/utils";

@customElement(computeChipComponentName("alarm-control-panel"))
export class AlarmControlPanelChip extends LitElement implements LovelaceChip {
  public static async getConfigElement(): Promise<LovelaceChipEditor> {
    await import("./alarm-control-panel-chip-editor");
    return document.createElement(
      computeChipEditorComponentName("alarm-control-panel")
    ) as LovelaceChipEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<AlarmControlPanelChipConfig> {
    const entities = Object.keys(hass.states);
    const panels = entities.filter((e) =>
      ALARM_CONTROl_PANEL_ENTITY_DOMAINS.includes(e.split(".")[0])
    );
    return {
      type: `alarm-control-panel`,
      entity: panels[0],
    };
  }

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: EntityChipConfig;

  public setConfig(config: EntityChipConfig): void {
    this._config = config;
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.hass!, this._config!, ev.detail.action!);
  }

  protected render() {
    if (!this.hass || !this._config || !this._config.entity) {
      return nothing;
    }

    const entityId = this._config.entity;
    const stateObj = this.hass.states[entityId] as HassEntity | undefined;

    if (!stateObj) {
      return nothing;
    }

    const name = this._config.name || stateObj.attributes.friendly_name || "";
    const icon = this._config.icon;
    const iconColor = getStateColor(stateObj.state);
    const iconPulse = shouldPulse(stateObj.state);

    const stateDisplay = this.hass.formatEntityState(stateObj);

    const iconStyle = {};
    if (iconColor) {
      const iconRgbColor = computeRgbColor(iconColor);
      iconStyle["--color"] = `rgb(${iconRgbColor})`;
    }

    const content = computeInfoDisplay(
      this._config.content_info ?? "state",
      name,
      stateDisplay,
      stateObj,
      this.hass
    );

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
          .stateObj=${stateObj}
          .icon=${icon}
          style=${styleMap(iconStyle)}
          class=${classMap({ pulse: iconPulse })}
        ></ha-state-icon>
        ${content ? html`<span>${content}</span>` : nothing}
      </mushroom-chip>
    `;
  }

  // Animation cannot be defined on chip element, key-frames cannot be scoped to a slotted element: https://github.com/WICG/webcomponents/issues/748
  static get styles(): CSSResultGroup {
    return css`
      mushroom-chip {
        cursor: pointer;
      }
      ha-state-icon {
        color: var(--color);
      }
      ha-state-icon.pulse {
        animation: 1s ease 0s infinite normal none running pulse;
      }
      ${animation.pulse}
    `;
  }
}
