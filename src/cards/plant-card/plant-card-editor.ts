import { fireEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
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
import { PLANT_CARD_EDITOR_NAME, PLANT_ENTITY_DOMAINS } from "./const";
import { PlantCardConfig, flowerCardConfigStruct } from "./plant-card-config";

const FLOWER_CARD_FIELDS = [
    "use_plantbook_picture",
    "min_temperature",
    "max_temperature",
    "min_moisture",
    "max_moisture",
    "min_conductivity",
    "max_conductivity",
    "min_brightness",
    "max_brightness",
];

const actions: Action[] = ["more-info", "navigate", "url", "call-service", "none"];

const computeSchema = memoizeOne((icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: PLANT_ENTITY_DOMAINS } } },
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
            { name: "hide_name", selector: { boolean: {} } },
            { name: "use_plantbook_picture", selector: { boolean: {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "min_temperature", selector: { number: { mode: "box" } }, default: 3 },
            { name: "max_temperature", selector: { number: { mode: "box" } }, default: 35 },
            { name: "min_moisture", selector: { number: { mode: "box" } }, default: 20 },
            { name: "max_moisture", selector: { number: { mode: "box" } }, default: 60 },
            { name: "min_conductivity", selector: { number: { mode: "box" } }, default: 500 },
            { name: "max_conductivity", selector: { number: { mode: "box" } }, default: 3000 },
            { name: "min_brightness", selector: { number: { mode: "box" } }, default: 2500 },
            { name: "max_brightness", selector: { number: { mode: "box" } }, default: 30000 },
        ],
    },
    { name: "tap_action", selector: { "mush-action": { actions } } },
    { name: "hold_action", selector: { "mush-action": { actions } } },
    { name: "double_tap_action", selector: { "mush-action": { actions } } },
]);

@customElement(PLANT_CARD_EDITOR_NAME)
export class PlantCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: PlantCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: PlantCardConfig): void {
        assert(config, flowerCardConfigStruct);
        this._config = config;
    }

    private _computeLabelCallback = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (FLOWER_CARD_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.plant.${schema.name}`);
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
        return configElementStyle;
    }
}
