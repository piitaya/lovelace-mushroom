import {
    ActionHandlerEvent,
    computeStateDisplay,
    formatNumber,
    handleAction,
    hasAction,
    HomeAssistant,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LovelaceChip } from ".";
import { actionHandler } from "../../../utils/directives/action-handler-directive";
import { WeatherChipConfig } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { getWeatherStateSVG, weatherSVGStyles } from "../../../utils/weather";
import {
    computeChipComponentName,
    computeChipEditorComponentName,
} from "../utils";
import "./weather-chip-editor";

@customElement(computeChipComponentName("weather"))
export class WeatherChip extends LitElement implements LovelaceChip {
    public static async getConfigElement(): Promise<LovelaceChipEditor> {
        return document.createElement(
            computeChipEditorComponentName("weather")
        ) as LovelaceChipEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<WeatherChipConfig> {
        const entities = Object.keys(hass.states);
        const weathers = entities.filter(
            (e) => e.substr(0, e.indexOf(".")) === "weather"
        );
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

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const weatherIcon = getWeatherStateSVG(entity.state, true);

        const displayLabels: string[] = [];

        if (this._config.show_conditions) {
            const stateDisplay = computeStateDisplay(
                this.hass.localize,
                entity,
                this.hass.locale
            );
            displayLabels.push(stateDisplay);
        }

        if (this._config.show_temperature) {
            const temperatureDisplay = `${formatNumber(
                entity.attributes.temperature,
                this.hass.locale
            )} ${this.hass.config.unit_system.temperature}`;
            displayLabels.push(temperatureDisplay);
        }

        return html`
            <mushroom-chip
                @action=${this._handleAction}
                .actionHandler=${actionHandler({
                    hasHold: hasAction(this._config.hold_action),
                    hasDoubleClick: hasAction(this._config.double_tap_action),
                })}
            >
                ${weatherIcon}
                ${displayLabels.length > 0
                    ? html`<span>${displayLabels.join(" / ")}</span>`
                    : null}
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
