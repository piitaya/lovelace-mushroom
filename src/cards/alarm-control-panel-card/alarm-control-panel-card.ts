import { HassEntity } from "home-assistant-js-websocket";
import {
  css,
  CSSResultGroup,
  html,
  nothing,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  actionHandler,
  ActionHandlerEvent,
  computeRTL,
  handleAction,
  hasAction,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardEditor,
} from "../../ha";
import {
  ALARM_MODES,
  AlarmMode,
  setProtectedAlarmControlPanelMode,
} from "../../ha/data/alarm_control_panel";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/button-group";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { computeEntityPicture } from "../../utils/info";
import { AlarmControlPanelCardConfig } from "./alarm-control-panel-card-config";
import {
  ALARM_CONTROl_PANEL_CARD_EDITOR_NAME,
  ALARM_CONTROl_PANEL_CARD_NAME,
  ALARM_CONTROl_PANEL_ENTITY_DOMAINS,
} from "./const";
import {
  getStateColor,
  hasCode,
  isActionsAvailable,
  isDisarmed,
  shouldPulse,
} from "./utils";

registerCustomCard({
  type: ALARM_CONTROl_PANEL_CARD_NAME,
  name: "Mushroom Alarm Control Panel Card",
  description: "Card for alarm control panel",
});

type ActionButtonType = {
  mode: AlarmMode;
  disabled?: boolean;
};

/*
 * Ref: https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-alarm-panel-card.ts
 * TODO: customize icon for modes (advanced YAML configuration)
 */

@customElement(ALARM_CONTROl_PANEL_CARD_NAME)
export class AlarmControlPanelCard
  extends MushroomBaseCard<AlarmControlPanelCardConfig>
  implements LovelaceCard
{
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./alarm-control-panel-card-editor");
    return document.createElement(
      ALARM_CONTROl_PANEL_CARD_EDITOR_NAME
    ) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<AlarmControlPanelCardConfig> {
    const entities = Object.keys(hass.states);
    const panels = entities.filter((e) =>
      ALARM_CONTROl_PANEL_ENTITY_DOMAINS.includes(e.split(".")[0])
    );
    return {
      type: `custom:${ALARM_CONTROl_PANEL_CARD_NAME}`,
      entity: panels[0],
      states: ["armed_home", "armed_away"],
    };
  }

  protected get hasControls(): boolean {
    return Boolean(this._config?.states?.length);
  }

  private _onTap(e: MouseEvent, mode: AlarmMode): void {
    e.stopPropagation();
    setProtectedAlarmControlPanelMode(this, this.hass!, this._stateObj!, mode);
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.hass!, this._config!, ev.detail.action!);
  }

  protected render() {
    if (!this.hass || !this._config || !this._config.entity) {
      return nothing;
    }

    const stateObj = this._stateObj;

    if (!stateObj) {
      return this.renderNotFound(this._config);
    }

    const name = this._config.name || stateObj.attributes.friendly_name || "";
    const icon = this._config.icon;
    const appearance = computeAppearance(this._config);
    const picture = computeEntityPicture(stateObj, appearance.icon_type);

    const actions: ActionButtonType[] =
      this._config.states && this._config.states.length > 0
        ? isDisarmed(stateObj)
          ? this._config.states.map((state) => ({ mode: state }))
          : [{ mode: "disarmed" }]
        : [];

    const isActionEnabled = isActionsAvailable(stateObj);

    const rtl = computeRTL(this.hass);

    return html`
      <ha-card
        class=${classMap({ "fill-container": appearance.fill_container })}
      >
        <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
          <mushroom-state-item
            ?rtl=${rtl}
            .appearance=${appearance}
            @action=${this._handleAction}
            .actionHandler=${actionHandler({
              hasHold: hasAction(this._config.hold_action),
              hasDoubleClick: hasAction(this._config.double_tap_action),
            })}
          >
            ${picture
              ? this.renderPicture(picture)
              : this.renderIcon(stateObj, icon)}
            ${this.renderBadge(stateObj)}
            ${this.renderStateInfo(stateObj, appearance, name)};
          </mushroom-state-item>
          ${actions.length > 0
            ? html`
                <div class="actions">
                  <mushroom-button-group
                    .fill="${appearance.layout !== "horizontal"}"
                    ?rtl=${rtl}
                  >
                    ${actions.map(
                      (action) => html`
                        <mushroom-button
                          @click=${(e) => this._onTap(e, action.mode)}
                          .disabled=${!isActionEnabled}
                        >
                          <ha-icon .icon=${ALARM_MODES[action.mode].icon}>
                          </ha-icon>
                        </mushroom-button>
                      `
                    )}
                  </mushroom-button-group>
                </div>
              `
            : nothing}
        </mushroom-card>
      </ha-card>
    `;
  }

  protected renderIcon(stateObj: HassEntity, icon?: string): TemplateResult {
    const color = getStateColor(stateObj.state);
    const shapePulse = shouldPulse(stateObj.state);
    const iconStyle = {
      "--icon-color": `rgb(${color})`,
      "--shape-color": `rgba(${color}, 0.2)`,
    };
    return html`
      <mushroom-shape-icon
        slot="icon"
        style=${styleMap(iconStyle)}
        class=${classMap({ pulse: shapePulse })}
      >
        <ha-state-icon
          .hass=${this.hass}
          .stateObj=${stateObj}
          .icon=${icon}
        ></ha-state-icon>
      </mushroom-shape-icon>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cardStyle,
      css`
        mushroom-state-item {
          cursor: pointer;
        }
        mushroom-shape-icon.pulse {
          --shape-animation: 1s ease 0s infinite normal none running pulse;
        }
      `,
    ];
  }
}
