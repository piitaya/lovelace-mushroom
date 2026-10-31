import { HassEntity } from "home-assistant-js-websocket";
import {
  css,
  CSSResultGroup,
  html,
  nothing,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  actionHandler,
  ActionHandlerEvent,
  computeRTL,
  handleAction,
  hasAction,
  HomeAssistant,
  isActive,
  LovelaceCard,
  LovelaceCardEditor,
  LovelaceGridOptions,
  LovelaceLayoutOptions,
  VacuumEntity,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { computeEntityName } from "../../utils/compute-entity-name";
import { registerCustomCard } from "../../utils/custom-cards";
import { computeEntityPicture } from "../../utils/info";
import {
  VACUUM_CARD_EDITOR_NAME,
  VACUUM_CARD_NAME,
  VACUUM_ENTITY_DOMAINS,
} from "./const";
import "../select-card/controls/select-option-control";
import "./controls/vacuum-commands-control";
import "./controls/vacuum-fan-speed-control";
import { isFanSpeedControlSupported } from "./controls/vacuum-fan-speed-control";
import {
  isCommandsControlSupported,
  isCommandsControlVisible,
} from "./controls/vacuum-commands-control";
import {
  injectModeControlInMoreInfo,
  VacuumMoreInfoModeControl,
} from "./more-info-mode-control";
import { isCleaning, isReturningHome } from "./utils";
import { VacuumCardConfig } from "./vacuum-card-config";

const MODE_ICON = "mdi:broom";

registerCustomCard({
  type: VACUUM_CARD_NAME,
  name: "Mushroom Vacuum Card",
  description: "Card for vacuum entity",
});

@customElement(VACUUM_CARD_NAME)
export class VacuumCard
  extends MushroomBaseCard<VacuumCardConfig, VacuumEntity>
  implements LovelaceCard
{
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./vacuum-card-editor");
    return document.createElement(
      VACUUM_CARD_EDITOR_NAME
    ) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<VacuumCardConfig> {
    const entities = Object.keys(hass.states);
    const vacuums = entities.filter((e) =>
      VACUUM_ENTITY_DOMAINS.includes(e.split(".")[0])
    );
    return {
      type: `custom:${VACUUM_CARD_NAME}`,
      entity: vacuums[0],
    };
  }

  protected get hasControls() {
    if (!this._stateObj || !this._config) return false;
    return (
      isCommandsControlSupported(this._stateObj, this._config.commands ?? []) ||
      this._isFanSpeedControlVisible(this._stateObj) ||
      this._isModeControlVisible
    );
  }

  // The base card reserves a single row for controls. When both the
  // commands and the dropdowns are displayed, we need an extra row.
  private get _extraControlRows(): number {
    if (!this._stateObj || !this._config) return 0;
    const appearance = computeAppearance(this._config);
    if (appearance.layout === "horizontal") return 0;
    const hasCommands = isCommandsControlSupported(
      this._stateObj,
      this._config.commands ?? []
    );
    const hasSelects =
      this._isFanSpeedControlVisible(this._stateObj) ||
      this._isModeControlVisible;
    return hasCommands && hasSelects ? 1 : 0;
  }

  public getCardSize(): number | Promise<number> {
    return (super.getCardSize() as number) + this._extraControlRows;
  }

  public getLayoutOptions(): LovelaceLayoutOptions {
    const options = super.getLayoutOptions();
    if (options.grid_rows !== undefined) {
      options.grid_rows += this._extraControlRows;
    }
    return options;
  }

  public getGridOptions(): LovelaceGridOptions {
    const options = super.getGridOptions();
    const extra = this._extraControlRows;
    if (typeof options.rows === "number") options.rows += extra;
    if (typeof options.min_rows === "number") options.min_rows += extra;
    return options;
  }

  private get _isModeControlVisible(): boolean {
    return (
      Boolean(this._config?.show_mode_control) && Boolean(this._modeStateObj)
    );
  }

  private get _modeStateObj(): HassEntity | undefined {
    const entityId = this._config?.mode_entity;
    return entityId ? this.hass?.states[entityId] : undefined;
  }

  private _isFanSpeedControlVisible(stateObj: VacuumEntity): boolean {
    return (
      Boolean(this._config?.show_fan_speed_control) &&
      isFanSpeedControlSupported(stateObj)
    );
  }

  private _computeStateDisplay(stateObj: VacuumEntity): string {
    let stateDisplay = this.hass.formatEntityState(stateObj);
    if (
      this._config?.show_fan_speed_state &&
      stateObj.attributes.fan_speed != null
    ) {
      const fanSpeed = this.hass.formatEntityAttributeValue(
        stateObj,
        "fan_speed"
      );
      stateDisplay += ` ⸱ ${fanSpeed}`;
    }
    const modeStateObj = this._modeStateObj;
    if (this._config?.show_mode_state && modeStateObj) {
      stateDisplay += ` ⸱ ${this.hass.formatEntityState(modeStateObj)}`;
    }
    return stateDisplay;
  }

  private _moreInfoModeControl?: VacuumMoreInfoModeControl;

  private _handleAction(ev: ActionHandlerEvent) {
    const action = ev.detail.action!;
    handleAction(this, this.hass!, this._config!, action);

    // Add the cleaning mode select to the vacuum more-info dialog
    const config = this._config!;
    const actionConfig = config[`${action}_action`] as
      | { action: string; entity?: string }
      | undefined;
    const entityId = actionConfig?.entity ?? config.entity;
    if (
      actionConfig?.action === "more-info" &&
      config.mode_entity &&
      entityId &&
      entityId === config.entity
    ) {
      injectModeControlInMoreInfo(
        entityId,
        config.mode_entity,
        () => this.hass,
        (control) => {
          this._moreInfoModeControl = control;
        }
      );
    }
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (changedProps.has("hass") && this._moreInfoModeControl) {
      if (this._moreInfoModeControl.isConnected) {
        this._moreInfoModeControl.hass = this.hass;
      } else {
        this._moreInfoModeControl = undefined;
      }
    }
  }

  protected render() {
    if (!this._config || !this.hass || !this._config.entity) {
      return nothing;
    }

    const stateObj = this._stateObj;

    if (!stateObj) {
      return this.renderNotFound(this._config);
    }

    const name = computeEntityName(this.hass, stateObj, this._config.name);
    const icon = this._config.icon;
    const appearance = computeAppearance(this._config);
    const picture = computeEntityPicture(stateObj, appearance.icon_type);

    const rtl = computeRTL(this.hass);

    const commands = this._config?.commands ?? [];
    const stateDisplay = this._computeStateDisplay(stateObj);
    const fanSpeedVisible = this._isFanSpeedControlVisible(stateObj);
    const modeStateObj = this._isModeControlVisible
      ? this._modeStateObj
      : undefined;

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
            ${this.renderStateInfo(stateObj, appearance, name, stateDisplay)};
          </mushroom-state-item>
          ${isCommandsControlVisible(stateObj, commands)
            ? html`
                <div class="actions" ?rtl=${rtl}>
                  <mushroom-vacuum-commands-control
                    .hass=${this.hass}
                    .entity=${stateObj}
                    .commands=${commands}
                    .fill=${appearance.layout !== "horizontal"}
                  >
                  </mushroom-vacuum-commands-control>
                </div>
              `
            : nothing}
          ${fanSpeedVisible || modeStateObj
            ? html`
                <div class="actions selects" ?rtl=${rtl}>
                  ${fanSpeedVisible
                    ? html`
                        <mushroom-vacuum-fan-speed-control
                          .hass=${this.hass}
                          .entity=${stateObj}
                        ></mushroom-vacuum-fan-speed-control>
                      `
                    : nothing}
                  ${modeStateObj
                    ? html`
                        <mushroom-select-option-control
                          .hass=${this.hass}
                          .entity=${modeStateObj}
                          .icon=${MODE_ICON}
                        ></mushroom-select-option-control>
                      `
                    : nothing}
                </div>
              `
            : nothing}
        </mushroom-card>
      </ha-card>
    `;
  }

  protected renderIcon(stateObj: HassEntity, icon?: string): TemplateResult {
    return html`
      <mushroom-shape-icon
        slot="icon"
        class=${classMap({
          returning:
            isReturningHome(stateObj) && Boolean(this._config?.icon_animation),
          cleaning:
            isCleaning(stateObj) && Boolean(this._config?.icon_animation),
        })}
        style=${styleMap({})}
        .disabled=${!isActive(stateObj)}
      >
        <ha-state-icon
          .hass=${this.hass}
          .stateObj=${stateObj}
          .icon=${icon}
        ></ha-state-icon
      ></mushroom-shape-icon>
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
        mushroom-shape-icon {
          --icon-color: rgb(var(--rgb-state-vacuum));
          --shape-color: rgba(var(--rgb-state-vacuum), 0.2);
        }
        .cleaning ha-state-icon {
          animation: 5s infinite linear cleaning;
        }
        .cleaning ha-state-icon {
          animation: 2s infinite linear returning;
        }
        mushroom-vacuum-commands-control {
          flex: 1;
        }
        .actions.selects {
          overflow: visible;
        }
        mushroom-vacuum-fan-speed-control,
        mushroom-select-option-control {
          flex: 1;
          min-width: 0;
          --card-primary-color: rgb(var(--rgb-state-vacuum));
          --mdc-theme-primary: rgb(var(--rgb-state-vacuum));
        }
      `,
    ];
  }
}
