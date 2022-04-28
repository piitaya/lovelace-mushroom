import { fireEvent, LovelaceCardEditor } from "custom-card-helpers";
import { CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { configElementStyle } from "../../utils/editor-styles";
import { GENERIC_FIELDS } from "../../utils/form/fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import { LIGHT_CARD_EDITOR_NAME, LIGHT_ENTITY_DOMAINS } from "./const";
import { LightCardConfig, lightCardConfigStruct } from "./light-card-config";

export const LIGHT_FIELDS = [
    "show_brightness_control",
    "use_light_color",
    "show_color_temp_control",
    "show_color_control",
];

const computeSchema = memoizeOne((icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: LIGHT_ENTITY_DOMAINS } } },
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
            { name: "collapsible_controls", selector: { boolean: {} } },
            { name: "use_light_color", selector: { boolean: {} } },
            { name: "show_brightness_control", selector: { boolean: {} } },
            { name: "show_color_temp_control", selector: { boolean: {} } },
            { name: "show_color_control", selector: { boolean: {} } },
        ],
    },
    { name: "tap_action", selector: { "mush-action": {} } },
    { name: "hold_action", selector: { "mush-action": {} } },
    { name: "double_tap_action", selector: { "mush-action": {} } },
]);

@customElement(LIGHT_CARD_EDITOR_NAME)
export class LightCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: LightCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: LightCardConfig): void {
        assert(config, lightCardConfigStruct);
        this._config = config;
    }

    private _computeLabelCallback = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (LIGHT_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.light.${schema.name}`);
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
        return [super.styles, configElementStyle];
    }
}
