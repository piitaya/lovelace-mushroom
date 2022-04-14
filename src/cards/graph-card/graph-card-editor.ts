import { fireEvent, HomeAssistant, LovelaceCardEditor, stateIcon } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import setupCustomlocalize from "../../localize";
import { configElementStyle } from "../../utils/editor-styles";
import { Action } from "../../utils/form/custom/ha-selector-mushroom-action";
import { GENERIC_FIELDS } from "../../utils/form/fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { GRAPH_CARD_EDITOR_NAME, GRAPH_ENTITY_DOMAINS } from "./const";
import { GraphCardConfig, graphCardConfigStruct } from "./graph-card-config";
import { assert } from "superstruct";

const actions: Action[] = ["more-info", "call-service", "none"];

const computeSchema = memoizeOne((icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: GRAPH_ENTITY_DOMAINS } } },
    { name: "name", selector: { text: {} } },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "icon", selector: { icon: { placeholder: icon } } },
            { name: "hours_to_show", selector: { number: { min: 1, max: 48, mode: "box", step: 1 } } },            
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "graph_color", selector: { "mush-color": {} } },
            { name: "fill", selector: { boolean : { } } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "hours_to_show", selector: { number: { min: 1, max: 48, mode: "box", step: 1 } } },
        ],
    },
    { name: "tap_action", selector: { "mush-action": { actions } } },
    { name: "hold_action", selector: { "mush-action": { actions } } },
    { name: "double_tap_action", selector: { "mush-action": { actions } } },
]);

@customElement(GRAPH_CARD_EDITOR_NAME)
export class GraphCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: GraphCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: GraphCardConfig): void {
        assert(config, graphCardConfigStruct);
        this._config = config;
    }

    private _computeLabelCallback = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
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
