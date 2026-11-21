import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ClimateEntity, HomeAssistant, isAvailable } from "../../../ha";
import setupCustomlocalize from "../../../localize";
import { PREFIX_NAME } from "../../../const";

export type ClimateModeType = "fan_mode" | "swing_mode" | "preset_mode";

type ClimateModeConfig = boolean | string[] | undefined;

const MODE_OPTIONS_ATTRIBUTES = {
  fan_mode: "fan_modes",
  swing_mode: "swing_modes",
  preset_mode: "preset_modes",
} as const;

const MODE_SERVICES = {
  fan_mode: "set_fan_mode",
  swing_mode: "set_swing_mode",
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
  swing_mode: "mdi:arrow-all",
  preset_mode: "mdi:thermostat",
};

export const getClimateModeOptions = (
  entity: ClimateEntity,
  type: ClimateModeType,
  config: ClimateModeConfig
): string[] => {
  const supportedModes = entity.attributes[MODE_OPTIONS_ATTRIBUTES[type]] ?? [];
  if (config === true) return supportedModes;
  if (Array.isArray(config)) {
    return config.filter((mode) => supportedModes.includes(mode));
  }
  return [];
};

@customElement(`${PREFIX_NAME}-climate-mode-control`)
export class ClimateModeControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: ClimateEntity;

  @property() public control!: ClimateModeType;

  @property({ attribute: false }) public modes!: string[];

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
    if (this.control === "fan_mode") {
      return mode === "auto" ? "orange" : "green";
    }
    if (this.control === "swing_mode") {
      return mode === "off" ? "orange" : "blue";
    }
    const presetColors: Record<string, string> = {
      eco: "green",
      away: "orange",
      boost: "red",
      sleep: "purple",
      none: "grey",
    };
    return presetColors[mode] ?? "deep-orange";
  }

  protected render(): TemplateResult {
    const available = isAvailable(this.entity);
    const activeMode = this.entity.attributes[this.control];

    return html`
      <div class="container">
        ${this.modes.map((mode) => {
          const active = mode === activeMode;
          const label = this.getLabel(mode);
          const icon =
            MODE_ICONS[this.control][mode] ?? DEFAULT_MODE_ICONS[this.control];
          const style = {
            "--active-rgb": `var(--rgb-${this.getActiveColor(mode)})`,
          };
          return html`
            <button
              type="button"
              class=${active ? "mode active" : "mode"}
              style=${styleMap(style)}
              title=${label}
              aria-label=${label}
              aria-pressed=${active ? "true" : "false"}
              .disabled=${!available}
              @click=${(event: Event) => this.callService(mode, event)}
            >
              <ha-icon .icon=${icon}></ha-icon>
              <span>${label}</span>
            </button>
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
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .container::-webkit-scrollbar {
        display: none;
      }
      .mode {
        display: flex;
        flex: none;
        align-items: center;
        justify-content: center;
        gap: 5px;
        min-height: 36px;
        padding: 0 10px;
        border: none;
        border-radius: 18px;
        background: rgba(var(--rgb-primary-text-color), 0.05);
        color: var(--secondary-text-color);
        font-family: inherit;
        font-size: 14px;
        cursor: pointer;
      }
      .mode.active {
        color: rgb(var(--active-rgb));
        background: rgba(var(--active-rgb), 0.12);
      }
      .mode:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
      ha-icon {
        --mdc-icon-size: 20px;
      }
    `;
  }
}
