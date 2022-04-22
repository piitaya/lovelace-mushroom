import { fireEvent, HomeAssistant, LocalizeFunc, LovelaceCardEditor } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { configElementStyle } from "../../utils/editor-styles";
import { Action } from "../../utils/form/custom/ha-selector-mushroom-action";
import { GENERIC_FIELDS } from "../../utils/form/fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import {
    alarmControlPanelCardCardConfigStruct,
    AlarmControlPanelCardConfig,
} from "./alarm-control-panel-card-config";
import { ALARM_CONTROl_PANEL_CARD_EDITOR_NAME, ALARM_CONTROl_PANEL_ENTITY_DOMAINS } from "./const";

const actions: Action[] = ["more-info", "navigate", "url", "call-service", "none"];

const states = ["armed_home", "armed_away", "armed_night", "armed_vacation", "armed_custom_bypass"];

const ALARM_CONTROL_PANEL_FIELDS = ["show_keypad"];

const computeSchema = memoizeOne((localize: LocalizeFunc, icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: ALARM_CONTROl_PANEL_ENTITY_DOMAINS } } },
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
        type: "multi_select",
        name: "states",
        options: states.map((state) => [
            state,
            localize(`ui.card.alarm_control_panel.${state.replace("armed", "arm")}`),
        ]) as [string, string][],
    },
    { name: "show_keypad", selector: { boolean: {} } },
    { name: "tap_action", selector: { "mush-action": { actions } } },
    { name: "hold_action", selector: { "mush-action": { actions } } },
    { name: "double_tap_action", selector: { "mush-action": { actions } } },
]);

@customElement(ALARM_CONTROl_PANEL_CARD_EDITOR_NAME)
export class SwitchCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: AlarmControlPanelCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: AlarmControlPanelCardConfig): void {
        assert(config, alarmControlPanelCardCardConfigStruct);
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const entityState = this._config.entity ? this.hass.states[this._config.entity] : undefined;
        const entityIcon = entityState ? stateIcon(entityState) : undefined;
        const icon = this._config.icon || entityIcon;
        const schema = computeSchema(this.hass!.localize, icon);

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

    private _computeLabelCallback = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (ALARM_CONTROL_PANEL_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.alarm_control_panel.${schema.name}`);
        }
        if (schema.name === "states") {
            return this.hass!.localize(
                "ui.panel.lovelace.editor.card.alarm-panel.available_states"
            );
        }

        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }

    static get styles(): CSSResultGroup {
        return [configElementStyle];
    }
}
