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
  ClimateEntity,
  computeRTL,
  formatNumber,
  handleAction,
  hasAction,
  HomeAssistant,
  HvacMode,
  isActive,
  isAvailable,
  LovelaceCard,
  LovelaceCardEditor,
  LovelaceGridOptions,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { computeEntityName } from "../../utils/compute-entity-name";
import { registerCustomCard } from "../../utils/custom-cards";
import { computeEntityPicture } from "../../utils/info";
import { ClimateCardConfig } from "./climate-card-config";
import {
  CLIMATE_CARD_EDITOR_NAME,
  CLIMATE_CARD_NAME,
  CLIMATE_ENTITY_DOMAINS,
} from "./const";
import "./controls/climate-hvac-modes-control";
import { isHvacModesVisible } from "./controls/climate-hvac-modes-control";
import "./controls/climate-temperature-control";
import { isTemperatureControlVisible } from "./controls/climate-temperature-control";
import "./controls/climate-mode-control";
import {
  ClimateModeType,
  getClimateModeOptions,
} from "./controls/climate-mode-control";
import {
  getHvacActionColor,
  getHvacActionIcon,
  getHvacModeColor,
  getHvacModeIcon,
} from "./utils";

type ClimateCardControl = "temperature_control" | "hvac_mode_control";

const CONTROLS_ICONS: Record<ClimateCardControl, string> = {
  temperature_control: "mdi:thermometer",
  hvac_mode_control: "mdi:thermostat",
};

registerCustomCard({
  type: CLIMATE_CARD_NAME,
  name: "Mushroom Extended Climate Card",
  description: "Card for climate entity",
});

@customElement(CLIMATE_CARD_NAME)
export class ClimateCard
  extends MushroomBaseCard<ClimateCardConfig, ClimateEntity>
  implements LovelaceCard
{
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./climate-card-editor");
    return document.createElement(
      CLIMATE_CARD_EDITOR_NAME
    ) as LovelaceCardEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<ClimateCardConfig> {
    const entities = Object.keys(hass.states);
    const climates = entities.filter((e) =>
      CLIMATE_ENTITY_DOMAINS.includes(e.split(".")[0])
    );
    return {
      type: `custom:${CLIMATE_CARD_NAME}`,
      entity: climates[0],
    };
  }

  public getGridOptions(): LovelaceGridOptions {
    return {
      ...super.getGridOptions(),
      rows: "auto",
    } as unknown as LovelaceGridOptions;
  }

  @state() private _activeControl?: ClimateCardControl;

  @state() private _modeControlsExpanded = false;

  private get _controls(): ClimateCardControl[] {
    if (!this._config || !this._stateObj) return [];

    const stateObj = this._stateObj;
    const controls: ClimateCardControl[] = [];
    if (
      isTemperatureControlVisible(stateObj) &&
      this._config.show_temperature_control
    ) {
      controls.push("temperature_control");
    }
    if (isHvacModesVisible(stateObj, this._config.hvac_modes)) {
      controls.push("hvac_mode_control");
    }
    return controls;
  }

  protected get hasControls(): boolean {
    return this._controls.length > 0;
  }

  _onControlTap(ctrl, e): void {
    e.stopPropagation();
    this._activeControl = ctrl;
  }

  private _toggleModeControls(event: Event): void {
    event.stopPropagation();
    this._modeControlsExpanded = !this._modeControlsExpanded;
  }

  setConfig(config: ClimateCardConfig): void {
    super.setConfig({
      tap_action: {
        action: "toggle",
      },
      hold_action: {
        action: "more-info",
      },
      ...config,
    });
    this.updateActiveControl();
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (this.hass && changedProperties.has("hass")) {
      this.updateActiveControl();
    }
  }

  updateActiveControl() {
    const isActiveControlSupported = this._activeControl
      ? this._controls.includes(this._activeControl)
      : false;
    this._activeControl = isActiveControlSupported
      ? this._activeControl
      : this._controls[0];
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

    const name = computeEntityName(this.hass, stateObj, this._config.name);
    const icon = this._config.icon;
    const appearance = computeAppearance(this._config);
    const picture = computeEntityPicture(stateObj, appearance.icon_type);

    let stateDisplay = this.hass.formatEntityState(stateObj);
    if (stateObj.attributes.current_temperature !== null) {
      const temperature = this.hass.formatEntityAttributeValue(
        stateObj,
        "current_temperature"
      );
      stateDisplay += ` ⸱ ${temperature}`;
    }
    const rtl = computeRTL(this.hass);
    const controlsVisible =
      !this._config.collapsible_controls || isActive(stateObj);
    const isControlVisible = controlsVisible && this._controls.length > 0;
    const modeControls: {
      control: ClimateModeType;
      modes: string[];
      leadingPlaceholder?: boolean;
    }[] = [
      {
        control: "fan_mode",
        modes: getClimateModeOptions(
          stateObj,
          "fan_mode",
          this._config.fun_speed_controls
        ),
      },
      {
        control: "swing_mode",
        modes: getClimateModeOptions(
          stateObj,
          "swing_mode",
          this._config.fun_direction_control
        ).filter((mode) => !mode.startsWith("swing_")),
      },
      {
        control: "swing_mode",
        modes: getClimateModeOptions(
          stateObj,
          "swing_mode",
          this._config.fun_direction_control
        ).filter((mode) => mode.startsWith("swing_")),
        leadingPlaceholder: true,
      },
      {
        control: "swing_horizontal_mode",
        modes: getClimateModeOptions(
          stateObj,
          "swing_horizontal_mode",
          this._config.fun_direction_control
        ),
      },
      {
        control: "preset_mode",
        modes: getClimateModeOptions(
          stateObj,
          "preset_mode",
          this._config.special_modes_control
        ),
      },
    ];
    const hasModeControls = modeControls.some(({ modes }) => modes.length > 0);
    const isModeControlAvailable = controlsVisible && hasModeControls;
    const isActionsVisible = isControlVisible || isModeControlAvailable;

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
          ${isActionsVisible
            ? html`
                <div class="actions" ?rtl=${rtl}>
                  ${isControlVisible
                    ? html`
                        ${this.renderActiveControl(stateObj)}
                        ${this.renderOtherControls()}
                      `
                    : nothing}
                  ${isModeControlAvailable
                    ? html`
                        <button
                          type="button"
                          class="mode-controls-toggle"
                          title="Additional controls"
                          aria-label="Additional controls"
                          aria-expanded=${this._modeControlsExpanded
                            ? "true"
                            : "false"}
                          @click=${this._toggleModeControls}
                        >
                          <ha-icon .icon=${"mdi:chevron-down"}></ha-icon>
                        </button>
                      `
                    : nothing}
                </div>
              `
            : nothing}
        </mushroom-card>
        ${isModeControlAvailable
          ? html`
              <div
                class=${classMap({
                  "mode-controls-wrapper": true,
                  expanded: this._modeControlsExpanded,
                })}
                aria-hidden=${this._modeControlsExpanded ? "false" : "true"}
                ?inert=${!this._modeControlsExpanded}
              >
                <div class="mode-controls">
                  ${modeControls.map(
                    ({ control, modes, leadingPlaceholder }) =>
                      modes.length
                        ? html`
                            <div class="mode-control-row">
                              <mushroom-extended-climate-mode-control
                                .hass=${this.hass}
                                .entity=${stateObj}
                                .control=${control}
                                .modes=${modes}
                                .leadingPlaceholder=${leadingPlaceholder}
                              ></mushroom-extended-climate-mode-control>
                            </div>
                          `
                        : nothing
                  )}
                </div>
              </div>
            `
          : nothing}
      </ha-card>
    `;
  }

  protected renderIcon(stateObj: ClimateEntity, icon?: string): TemplateResult {
    const available = isAvailable(stateObj);
    const hvacMode = stateObj.state as HvacMode;
    const hvacAction = stateObj.attributes.hvac_action;
    const color = getHvacModeColor(hvacMode);
    const iconStyle = {};
    iconStyle["--icon-color"] = `rgb(${color})`;
    iconStyle["--shape-color"] = `rgba(${color}, 0.2)`;

    const modeIcon = getHvacModeIcon(hvacMode);
    const actionIcon = getHvacActionIcon(hvacAction);

    const finalIcon =
      actionIcon ||
      (this._config!.use_entity_icon ? stateObj.attributes.icon : modeIcon) ||
      icon;

    const shapeClasses = {
      spin: ["cool", "fan_only"].includes(hvacMode),
      heat: ["auto", "heat", "dry"].includes(hvacMode),
    };

    return html`
      <mushroom-extended-shape-icon
        slot="icon"
        .disabled=${!available}
        class=${classMap(shapeClasses)}
        style=${styleMap(iconStyle)}
      >
        <ha-state-icon
          .hass=${this.hass}
          .stateObj=${stateObj}
          .icon=${finalIcon}
        ></ha-state-icon>
      </mushroom-extended-shape-icon>
    `;
  }

  protected renderBadge(entity: ClimateEntity) {
    const unavailable = !isAvailable(entity);
    if (unavailable) {
      return super.renderBadge(entity);
    } else {
      return this.renderActionBadge(entity);
    }
  }

  renderActionBadge(entity: ClimateEntity) {
    const hvac_action = entity.attributes.hvac_action;
    if (!hvac_action || hvac_action == "off") return nothing;

    const color = getHvacActionColor(hvac_action);
    const icon = getHvacActionIcon(hvac_action);

    if (!icon) return nothing;

    return html`
      <mushroom-badge-icon
        slot="badge"
        .icon=${icon}
        style=${styleMap({
          "--main-color": `rgb(${color})`,
        })}
      ></mushroom-badge-icon>
    `;
  }

  private renderOtherControls(): TemplateResult | null {
    const otherControls = this._controls.filter(
      (control) => control != this._activeControl
    );

    return html`
      ${otherControls.map(
        (ctrl) => html`
          <mushroom-button @click=${(e) => this._onControlTap(ctrl, e)}>
            <ha-icon .icon=${CONTROLS_ICONS[ctrl]}></ha-icon>
          </mushroom-button>
        `
      )}
    `;
  }

  private renderActiveControl(entity: ClimateEntity) {
    const hvac_modes = this._config!.hvac_modes ?? [];
    const appearance = computeAppearance(this._config!);

    switch (this._activeControl) {
      case "temperature_control":
        return html`
          <mushroom-climate-temperature-control
            .hass=${this.hass}
            .entity=${entity}
            .fill=${appearance.layout !== "horizontal"}
          ></mushroom-climate-temperature-control>
        `;
      case "hvac_mode_control":
        return html`
          <mushroom-climate-hvac-modes-control
            .hass=${this.hass}
            .entity=${entity}
            .modes=${hvac_modes}
            .fill=${appearance.layout !== "horizontal"}
          ></mushroom-climate-hvac-modes-control>
        `;
      default:
        return nothing;
    }
  }

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cardStyle,
      css`
        mushroom-state-item {
          cursor: pointer;
        }
        mushroom-climate-temperature-control,
        mushroom-climate-hvac-modes-control {
          flex: 1;
        }
        .mode-controls-wrapper {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          pointer-events: none;
          transition:
            grid-template-rows 250ms ease,
            opacity 200ms ease;
        }
        .mode-controls-wrapper.expanded {
          grid-template-rows: 1fr;
          opacity: 1;
          pointer-events: auto;
        }
        .mode-controls {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-height: 0;
          overflow: hidden;
          padding: 0 var(--control-spacing);
          transition: padding-bottom 250ms ease;
        }
        .mode-controls-wrapper.expanded .mode-controls {
          padding-bottom: var(--control-spacing);
        }
        .mode-controls-toggle {
          display: flex;
          flex: none;
          align-items: center;
          justify-content: center;
          width: var(--control-height);
          height: var(--control-height);
          margin-left: auto;
          padding: 0;
          border: none;
          background: transparent;
          color: var(--secondary-text-color);
          cursor: pointer;
        }
        .mode-controls-toggle ha-icon {
          display: flex;
          width: 32px;
          height: 32px;
          --mdc-icon-size: 32px;
          transition: transform 250ms ease;
        }
        .mode-controls-toggle[aria-expanded="true"] ha-icon {
          transform: rotate(180deg);
        }
        .spin {
          --shape-animation: spin 2s linear infinite;
        }
        .heat {
          --shape-animation: heat 1.5s infinite !important;
        }
      `,
    ];
  }
}
