import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  svg,
  SVGTemplateResult,
  TemplateResult,
} from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ClimateEntity, HomeAssistant, isAvailable } from "../../../ha";
import setupCustomlocalize from "../../../localize";
import { PREFIX_NAME } from "../../../const";
import "../../../shared/button";

export type ClimateModeType =
  | "fan_mode"
  | "swing_mode"
  | "swing_horizontal_mode"
  | "preset_mode";

type ClimateModeConfig = boolean | string[] | undefined;

const MODE_OPTIONS_ATTRIBUTES = {
  fan_mode: "fan_modes",
  swing_mode: "swing_modes",
  swing_horizontal_mode: "swing_horizontal_modes",
  preset_mode: "preset_modes",
} as const;

const MODE_SERVICES = {
  fan_mode: "set_fan_mode",
  swing_mode: "set_swing_mode",
  swing_horizontal_mode: "set_swing_horizontal_mode",
  preset_mode: "set_preset_mode",
} as const;

const MODE_ICONS: Record<ClimateModeType, Record<string, string>> = {
  fan_mode: {
    auto: "mdi:fan-auto",
    low: "mdi:numeric-1-circle-outline",
    "medium low": "mdi:numeric-2-circle-outline",
    medium: "mdi:numeric-3-circle-outline",
    "medium high": "mdi:numeric-4-circle-outline",
    high: "mdi:numeric-5-circle-outline",
  },
  swing_mode: {
    off: "mdi:arrow-vertical-lock",
    vertical: "mdi:arrow-up-down",
    horizontal: "mdi:arrow-left-right",
    both: "mdi:arrow-all",
    default: "mdi:arrow-up-down",
    full_swing: "mdi:arrow-up-down",
    fixed_upper: "mdi:arrow-up",
    fixed_upper_middle: "mdi:arrow-up",
    fixed_middle: "mdi:minus",
    fixed_lower_middle: "mdi:arrow-down",
    fixed_lower: "mdi:arrow-down",
    swing_upper: "mdi:arrow-up",
    swing_upper_middle: "mdi:arrow-up",
    swing_middle: "mdi:arrow-up-down",
    swing_lower_middle: "mdi:arrow-down",
    swing_lower: "mdi:arrow-down",
  },
  swing_horizontal_mode: {
    default: "mdi:arrow-left-right",
    full_swing: "mdi:arrow-left-right",
    left: "mdi:arrow-left",
    left_center: "mdi:arrow-collapse-left",
    center: "mdi:align-horizontal-center",
    right_center: "mdi:arrow-collapse-right",
    right: "mdi:arrow-right",
  },
  preset_mode: {
    eco: "mdi:leaf",
    away: "mdi:walk",
    boost: "mdi:rocket-launch",
    sleep: "mdi:power-sleep",
    none: "mdi:close-circle-outline",
  },
};

const DEFAULT_MODE_ICONS: Record<ClimateModeType, string> = {
  fan_mode: "mdi:fan",
  swing_mode: "mdi:arrow-up-down",
  swing_horizontal_mode: "mdi:arrow-left-right",
  preset_mode: "mdi:thermostat",
};

const ALL_SWING_SEGMENTS = [0, 1, 2, 3, 4];

const SWING_ICON_SEGMENTS: Record<string, Record<string, number[]>> = {
  swing_mode: {
    off: [],
    vertical: ALL_SWING_SEGMENTS,
    horizontal: ALL_SWING_SEGMENTS,
    both: ALL_SWING_SEGMENTS,
    default: [],
    full_swing: ALL_SWING_SEGMENTS,
    fixed_upper: [0],
    fixed_upper_middle: [1],
    fixed_middle: [2],
    fixed_lower_middle: [3],
    fixed_lower: [4],
    swing_upper: [0, 1],
    swing_upper_middle: [0, 1, 2],
    swing_middle: [1, 2, 3],
    swing_lower_middle: [2, 3, 4],
    swing_lower: [3, 4],
  },
  swing_horizontal_mode: {
    default: [],
    full_swing: ALL_SWING_SEGMENTS,
    left: [0],
    left_center: [1],
    center: [2],
    right_center: [3],
    right: [4],
  },
};

const FAN_BLADE_PATH =
  "M12 2.5C15.2 2.5 16.8 5 15.6 8.1C14.8 10.1 9.2 10.1 8.4 8.1C7.2 5 8.8 2.5 12 2.5Z";

const FAN_MODE_BLADES: Record<string, number[]> = {
  low: [0],
  "medium low": [0, 1],
  medium: [0, 1, 2],
  "medium high": [0, 1, 2, 3],
  high: ALL_SWING_SEGMENTS,
};

export const getClimateModeOptions = (
  entity: ClimateEntity,
  type: ClimateModeType,
  config: ClimateModeConfig
): string[] => {
  const supportedModes = entity.attributes[MODE_OPTIONS_ATTRIBUTES[type]] ?? [];
  const modes =
    config === true
      ? supportedModes
      : Array.isArray(config)
        ? config.filter((mode) => supportedModes.includes(mode))
        : [];
  if (type === "preset_mode" && modes.includes("none")) {
    return ["none", ...modes.filter((mode) => mode !== "none")];
  }
  return modes;
};

@customElement(`${PREFIX_NAME}-climate-mode-control`)
export class ClimateModeControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: ClimateEntity;

  @property() public control!: ClimateModeType;

  @property({ attribute: false }) public modes!: string[];

  @property({ type: Boolean }) public leadingPlaceholder = false;

  private callService(mode: string, event: Event) {
    event.stopPropagation();
    this.hass.callService("climate", MODE_SERVICES[this.control], {
      entity_id: this.entity.entity_id,
      [this.control]: mode,
    });
  }

  private getLabel(mode: string): string {
    const customLocalize = setupCustomlocalize(this.hass);
    const key = `card.climate.${this.control}_list.${mode.replace(/ /g, "_")}`;
    const label = customLocalize(key);
    return label === key ? mode : label;
  }

  private getActiveColor(mode: string): string {
    return ["auto", "default", "none"].includes(mode) ? "green" : "blue";
  }

  private renderModeIcon(mode: string): TemplateResult | SVGTemplateResult {
    if (
      ["swing_mode", "swing_horizontal_mode"].includes(this.control) &&
      mode === "default"
    ) {
      return html`<ha-icon .icon=${"mdi:close-circle-outline"}></ha-icon>`;
    }
    const activeBlades = this.control === "fan_mode" && FAN_MODE_BLADES[mode];
    if (activeBlades) {
      return svg`
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          ${ALL_SWING_SEGMENTS.map(
            (index) => svg`<path
              d=${FAN_BLADE_PATH}
              transform=${`rotate(${index * 72} 12 12)`}
              opacity=${activeBlades.includes(index) ? 1 : 0.18}
            />`
          )}
          <circle cx="12" cy="12" r="2" />
        </svg>
      `;
    }
    const activeSegments = SWING_ICON_SEGMENTS[this.control]?.[mode];
    if (activeSegments) {
      const vertical = this.control === "swing_mode";
      return svg`
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          ${ALL_SWING_SEGMENTS.map((index) => {
            const opacity = activeSegments.includes(index) ? 1 : 0.18;
            return vertical
              ? svg`<rect
                  x="3"
                  y=${2 + index * 4.2}
                  width="18"
                  height="2.5"
                  rx="1.25"
                  opacity=${opacity}
                />`
              : svg`<rect
                  x=${2 + index * 4.2}
                  y="3"
                  width="2.5"
                  height="18"
                  rx="1.25"
                  opacity=${opacity}
                />`;
          })}
        </svg>
      `;
    }
    const icon =
      MODE_ICONS[this.control][mode] ?? DEFAULT_MODE_ICONS[this.control];
    return html`<ha-icon .icon=${icon}></ha-icon>`;
  }

  protected render(): TemplateResult {
    const available = isAvailable(this.entity);
    const activeMode = this.entity.attributes[this.control];

    return html`
      <div class="container">
        ${this.leadingPlaceholder
          ? html`<span
                class="mode-control-placeholder"
                aria-hidden="true"
              ></span
              ><span
                class="mode-control-placeholder"
                aria-hidden="true"
              ></span>`
          : null}
        ${this.modes.map((mode) => {
          const active = mode === activeMode;
          const label = this.getLabel(mode);
          const color = `var(--rgb-${this.getActiveColor(mode)})`;
          const style = active
            ? {
                "--icon-color": `rgb(${color})`,
                "--bg-color": `rgba(${color}, 0.2)`,
              }
            : {};
          return html`
            <mushroom-extended-button
              style=${styleMap(style)}
              .title=${label}
              .disabled=${!available}
              @click=${(event: Event) => this.callService(mode, event)}
            >
              ${this.renderModeIcon(mode)}
            </mushroom-extended-button>
          `;
        })}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
      }
      .container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing);
      }
      .mode-control-placeholder {
        flex: none;
        width: calc(var(--control-height) * var(--control-button-ratio));
        height: var(--control-height);
      }
    `;
  }
}
