import { UnsubscribeFunc } from "home-assistant-js-websocket";
import {
    css,
    CSSResultGroup,
    html,
    LitElement,
    nothing,
    PropertyValues,
    TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    computeStateDisplay,
    formatNumber,
    handleAction,
    hasAction,
    HomeAssistant,
    RenderTemplateResult,
    subscribeRenderTemplate,
} from "../../../ha";
import {
    computeChipComponentName,
    computeChipEditorComponentName,
} from "../../../utils/lovelace/chip/chip-element";
import { LovelaceChip, WeatherChipConfig } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { getWeatherStateSVG, weatherSVGStyles } from "../../../utils/weather";
import { HassEntity } from "home-assistant-js-websocket";

const TEMPLATE_KEYS = ["additional_information"] as const;
type TemplateKey = (typeof TEMPLATE_KEYS)[number];

@customElement(computeChipComponentName("weather"))
export class WeatherChip extends LitElement implements LovelaceChip {
    public static async getConfigElement(): Promise<LovelaceChipEditor> {
        await import("./weather-chip-editor");
        return document.createElement(
            computeChipEditorComponentName("weather")
        ) as LovelaceChipEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<WeatherChipConfig> {
        const entities = Object.keys(hass.states);
        const weathers = entities.filter((e) => e.split(".")[0] === "weather");
        return {
            type: `weather`,
            entity: weathers[0],
        };
    }

    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: WeatherChipConfig;

    @state() private _templateResults: Partial<
        Record<TemplateKey, RenderTemplateResult | undefined>
    > = {};

    @state() private _unsubRenderTemplates: Map<TemplateKey, Promise<UnsubscribeFunc>> = new Map();

    public setConfig(config: WeatherChipConfig): void {
        this._config = config;
    }

    public connectedCallback() {
        super.connectedCallback();
        this._tryConnect();
    }

    public disconnectedCallback() {
        this._tryDisconnect();
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    public isTemplate(key: TemplateKey) {
        const value = this._config?.[key];
        return value?.includes("{");
    }

    private getValue(key: TemplateKey) {
        return this.isTemplate(key)
            ? this._templateResults[key]?.result?.toString()
            : this._config?.[key];
    }

    protected render() {
        if (!this.hass || !this._config || !this._config.entity) {
            return nothing;
        }

        const entityId = this._config.entity;
        const stateObj = this.hass.states[entityId] as HassEntity | undefined;
        const additionalInformation = this.getValue("additional_information");

        if (!stateObj) {
            return nothing;
        }

        const weatherIcon = getWeatherStateSVG(stateObj.state, true);

        const displayLabels: string[] = [];

        if (this._config.show_conditions) {
            const stateDisplay = computeStateDisplay(
                this.hass.localize,
                stateObj,
                this.hass.locale,
                this.hass.entities,
                this.hass.connection.haVersion
            );
            displayLabels.push(stateDisplay);
        }

        if (this._config.show_temperature) {
            const temperatureDisplay = `${formatNumber(
                this._config.round_temperature ? Math.round(stateObj.attributes.temperature) : stateObj.attributes.temperature,
                this.hass.locale
            )} ${this.hass.config.unit_system.temperature}`;
            displayLabels.push(temperatureDisplay);
        }

        if (additionalInformation) {
            displayLabels.push(additionalInformation);
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
                    ? html`<span>${displayLabels.join(" / ")}</span>`
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

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        if (!this._config || !this.hass) {
            return;
        }

        this._tryConnect();
    }

    private async _tryConnect(): Promise<void> {
        TEMPLATE_KEYS.forEach((key) => {
            this._tryConnectKey(key);
        });
    }

    private async _tryConnectKey(key: TemplateKey): Promise<void> {
        if (
            this._unsubRenderTemplates.get(key) !== undefined ||
            !this.hass ||
            !this._config ||
            !this.isTemplate(key)
        ) {
            return;
        }

        try {
            const sub = subscribeRenderTemplate(
                this.hass.connection,
                (result) => {
                    this._templateResults = {
                        ...this._templateResults,
                        [key]: result,
                    };
                },
                {
                    template: this._config[key] ?? "",
                    variables: {
                        config: this._config,
                        user: this.hass.user!.name,
                        entity: this._config.entity,
                    },
                    strict: true,
                }
            );
            this._unsubRenderTemplates.set(key, sub);
            await sub;
        } catch (_err) {
            const result = {
                result: this._config[key] ?? "",
                listeners: {
                    all: false,
                    domains: [],
                    entities: [],
                    time: false,
                },
            };
            this._templateResults = {
                ...this._templateResults,
                [key]: result,
            };
            this._unsubRenderTemplates.delete(key);
        }
    }
    private async _tryDisconnect(): Promise<void> {
        TEMPLATE_KEYS.forEach((key) => {
            this._tryDisconnectKey(key);
        });
    }

    private async _tryDisconnectKey(key: TemplateKey): Promise<void> {
        const unsubRenderTemplate = this._unsubRenderTemplates.get(key);
        if (!unsubRenderTemplate) {
            return;
        }

        try {
            const unsub = await unsubRenderTemplate;
            unsub();
            this._unsubRenderTemplates.delete(key);
        } catch (err: any) {
            if (err.code === "not_found" || err.code === "template_error") {
                // If we get here, the connection was probably already closed. Ignore.
            } else {
                throw err;
            }
        }
    }
}
