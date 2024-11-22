import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  actionHandler,
  ActionHandlerEvent,
  computeRTL,
  formatNumber,
  handleAction,
  hasAction,
  HomeAssistant,
} from "../../../ha";
import {
  computeChipComponentName,
  computeChipEditorComponentName,
} from "../../../utils/lovelace/chip/chip-element";
import {
  LovelaceChip,
  WeatherChipConfig,
} from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { getWeatherStateSVG, weatherSVGStyles } from "../../../utils/weather";

@customElement(computeChipComponentName("weather"))
export class WeatherChip extends LitElement implements LovelaceChip {
  public static async getConfigElement(): Promise<LovelaceChipEditor> {
    await import("./weather-chip-editor");
    return document.createElement(
      computeChipEditorComponentName("weather")
    ) as LovelaceChipEditor;
  }

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<WeatherChipConfig> {
    const entities = Object.keys(hass.states);
    const weathers = entities.filter((e) => e.split(".")[0] === "weather");
    return {
      type: `weather`,
      entity: weathers[0],
    };
  }

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: WeatherChipConfig;

  public setConfig(config: WeatherChipConfig): void {
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

    const weatherIcon = getWeatherStateSVG(stateObj.state, true);

    const displayLabels: string[] = [];

    if (this._config.show_conditions) {
      const stateDisplay = this.hass.formatEntityState(stateObj);
      displayLabels.push(stateDisplay);
    }

    if (this._config.show_temperature) {
      const temperatureDisplay = this.hass.formatEntityAttributeValue(
        stateObj,
        "temperature"
      );
      displayLabels.push(temperatureDisplay);
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
        ${weatherIcon}
        ${displayLabels.length > 0
          ? html`<span>${displayLabels.join(" ⸱ ")}</span>`
          : nothing}
      </mushroom-chip>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      weatherSVGStyles,
      css`
        mushroom-chip {
          cursor: pointer;
        }
      `,
    ];
  }
}
