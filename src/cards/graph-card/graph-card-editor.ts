import {
    fireEvent,
    HomeAssistant,
    LocalizeFunc,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import setupCustomlocalize from "../../localize";
import { Action } from "../../utils/form/custom/ha-selector-mushroom-action";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import {
    DISPLAY_MODE,
    GRAPH_CARD_EDITOR_NAME,
    GRAPH_DEFAULT_HOURS,
    GRAPH_ENTITY_DOMAINS,
    GRAPH_MODE,
} from "./const";
import { GraphCardConfig, graphCardConfigStruct } from "./graph-card-config";
import { assert } from "superstruct";
import { SelectOption } from "../../utils/form/ha-selector";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { MushroomBaseElement } from "../../utils/base-element";

const actions: Action[] = ["more-info", "call-service", "none"];
const GRAPH_LABELS = ["graph_mode", "display_mode"];

const computeSchema = memoizeOne((localize: LocalizeFunc, icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: GRAPH_ENTITY_DOMAINS } } },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "name", selector: { text: {} } },
            { name: "icon", selector: { icon: { placeholder: icon } } },
        ],
    },

    {
        type: "grid",
        name: "",
        schema: [
            { name: "primary_info", selector: { "mush-info": {} } },
            { name: "secondary_info", selector: { "mush-info": {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "graph_color", selector: { "mush-color": {} } },
            {
                name: "hours_to_show",
                selector: { number: { min: 1, max: 168, mode: "box", step: 1 } },
            },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            {
                name: "graph_mode",
                selector: {
                    select: {
                        options: GRAPH_MODE.map(
                            (mode) =>
                                <SelectOption>{
                                    value: mode,
                                    label:
                                        localize(`editor.card.graph.graph_mode_type.${mode}`) ||
                                        mode,
                                }
                        ) as SelectOption[],
                        mode: "dropdown",
                    },
                },
            },
            {
                name: "display_mode",
                selector: {
                    select: {
                        options: DISPLAY_MODE.map(
                            (mode) =>
                                <SelectOption>{
                                    value: `${mode}`,
                                    label:
                                        localize(`editor.card.graph.display_mode_type.${mode}`) ||
                                        mode,
                                }
                        ) as SelectOption[],
                        mode: "dropdown",
                    },
                },
            },
        ],
    },
    { name: "tap_action", selector: { "mush-action": { actions } } },
    { name: "hold_action", selector: { "mush-action": { actions } } },
    { name: "double_tap_action", selector: { "mush-action": { actions } } },
]);

@customElement(GRAPH_CARD_EDITOR_NAME)
export class GraphCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
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

        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }

        if (GRAPH_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.graph.${schema.name}`);
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
        const customLocalize = setupCustomlocalize(this.hass!);
        const schema = computeSchema(customLocalize, icon);

        this._config = {
            hours_to_show: GRAPH_DEFAULT_HOURS,
            ...this._config,
        };

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
}
