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
import { ENTITY_CARD_EDITOR_NAME } from "./const";
import { EntityCardConfig, entityCardConfigStruct } from "./entity-card-config";

@customElement(ENTITY_CARD_EDITOR_NAME)
export class EntityCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: EntityCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: EntityCardConfig): void {
        assert(config, entityCardConfigStruct);
        this._config = config;
    }

    private _schema = memoizeOne((icon?: string): HaFormSchema[] => [
        { name: "entity", selector: { entity: {} } },
        { name: "name", selector: { text: {} } },
        {
            type: "grid",
            name: "",
            schema: [
                { name: "icon", selector: { icon: { placeholder: icon } } },
                { name: "icon_color", selector: { "mush-color": {} } },
            ],
        },
        {
            type: "grid",
            name: "",
            schema: [
                { name: "layout", selector: { "mush-layout": {} } },
                { name: "hide_icon", selector: { boolean: {} } },
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
        { name: "tap_action", selector: { "mush-action": {} } },
        { name: "hold_action", selector: { "mush-action": {} } },
        { name: "double_tap_action", selector: { "mush-action": {} } },
    ]);

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
        const schema = this._schema(icon);

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
