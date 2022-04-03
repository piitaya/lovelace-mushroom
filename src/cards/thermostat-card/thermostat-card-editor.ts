import { fireEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { configElementStyle } from "../../utils/editor-styles";
import { GENERIC_FIELDS } from "../../utils/form/fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import { THERMOSTAT_CARD_EDITOR_NAME, THERMOSTAT_ENTITY_DOMAINS } from "./const";
import { ThermostatCardConfig, thermostatCardConfigStruct } from "./thermostat-card-config";

export const THERMOSTAT_FIELDS = [
    "use_action_icon",
    "use_action_color",
    "show_mode_control",
    "show_temp_control",
    "show_temp_indicators",
    "temperature_gap",
];

const computeSchema = memoizeOne((icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: THERMOSTAT_ENTITY_DOMAINS } } },
    { name: "name", selector: { text: {} } },
    {
        type: "grid",
        name: "",
        schema: [{ name: "icon", selector: { icon: { placeholder: icon } } }],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "layout", selector: { "mush-layout": {} } },
            { name: "hide_state", selector: { boolean: {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "use_action_color", selector: { boolean: {} } },
            { name: "use_action_icon", selector: { boolean: {} } },
            { name: "show_mode_control", selector: { boolean: {} } },
            { name: "show_temp_control", selector: { boolean: {} } },
            { name: "show_temp_indicators", selector: { boolean: {} } },
        ],
    },
    {
        name: "temperature_gap",
        selector: { number: { min: 0, max: 5, step: 0.5, mode: "slider" } },
    },
    { name: "tap_action", selector: { "mush-action": {} } },
    { name: "hold_action", selector: { "mush-action": {} } },
    { name: "double_tap_action", selector: { "mush-action": {} } },
]);

@customElement(THERMOSTAT_CARD_EDITOR_NAME)
export class ThermostatCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: ThermostatCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: ThermostatCardConfig): void {
        assert(config, thermostatCardConfigStruct);
        this._config = config;
    }

    private _computeLabelCallback = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (THERMOSTAT_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.thermostat.${schema.name}`);
        }
        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const entityState = this._config.entity ? this.hass.states[this._config.entity] : undefined;
        const entityIcon = entityState ? stateIcon(entityState) : undefined;
        const icon = this._config.icon || entityIcon;
        const schema = computeSchema(icon);

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${schema}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }

    static get styles(): CSSResultGroup {
        return [configElementStyle];
    }
}
