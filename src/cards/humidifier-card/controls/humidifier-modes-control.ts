import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { HomeAssistant, HumidifierEntity, isAvailable } from "../../../ha";
import "../../../shared/button";
import "../../../shared/button-group";
import { computeRgbColor } from "../../../utils/colors";

type HumidifierMode =
  | "normal"
  | "eco"
  | "away"
  | "boost"
  | "comfort"
  | "home"
  | "sleep"
  | "auto"
  | "baby";

const MODE_ICONS: Record<HumidifierMode, string> = {
  normal: "mdi:water",
  eco: "mdi:leaf",
  away: "mdi:home-export-outline",
  boost: "mdi:water-plus",
  comfort: "mdi:sofa",
  home: "mdi:home",
  sleep: "mdi:sleep",
  auto: "mdi:refresh-auto",
  baby: "mdi:baby",
};

const MODE_COLORS: Record<HumidifierMode, string> = {
  normal: "var(--rgb-state-humidifier)",
  eco: "var(--rgb-state-humidifier-eco)",
  away: "var(--rgb-state-humidifier-away)",
  boost: "var(--rgb-state-humidifier-boost)",
  comfort: "var(--rgb-state-humidifier-comfort)",
  home: "var(--rgb-state-humidifier-home)",
  sleep: "var(--rgb-state-humidifier-sleep)",
  auto: "var(--rgb-state-humidifier-auto)",
  baby: "var(--rgb-state-humidifier-baby)",
};

@customElement("mushroom-humidifier-modes-control")
export class HumidifierModesControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: HumidifierEntity;

  @property({ attribute: false }) public modes?: string[];

  @state() private _modes: HumidifierMode[] = [];

  protected willUpdate(changedProperties: Map<string, any>): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has("modes")) {
      this._modes = (this.modes || []) as HumidifierMode[];
    }
  }

  protected render(): TemplateResult {
    const stateObj = this.entity;
    const currentMode = stateObj.state as HumidifierMode;

    return html`
      <mushroom-button-group .fill=${true}>
        ${this._modes.map((mode) => this.renderModeButton(mode))}
      </mushroom-button-group>
    `;
  }

  private renderModeButton(mode: HumidifierMode) {
    const iconStyle = {};
    const currentMode = this.entity.attributes.mode;
    const isActive = mode === currentMode;
    const isDeviceActive = this.entity.state === "on";
    const color = isDeviceActive 
      ? (isActive ? "var(--rgb-state-humidifier)" : "var(--rgb-disabled)")
      : "var(--rgb-disabled)";
    
    if (isActive) {
      iconStyle["--icon-color"] = `rgb(${color})`;
      iconStyle["--bg-color"] = `rgba(${color}, 0.2)`;
    }

    return html`
      <mushroom-button
        style=${styleMap(iconStyle)}
        .mode=${mode}
        .disabled=${!isAvailable(this.entity)}
        @click=${this._setMode}
      >
        <ha-icon .icon=${MODE_ICONS[mode]}></ha-icon>
      </mushroom-button>
    `;
  }

  private _setMode(e: CustomEvent) {
    e.stopPropagation();
    const mode = (e.target! as any).mode as HumidifierMode;
    this.hass.callService("humidifier", "set_mode", {
      entity_id: this.entity.entity_id,
      mode: mode,
    });
  }
}
