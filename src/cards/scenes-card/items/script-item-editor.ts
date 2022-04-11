import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import setupCustomlocalize from "../../../localize";
import { configElementStyle } from "../../../utils/editor-styles";
import { GENERIC_FIELDS } from "../../../utils/form/fields";
import { HaFormSchema } from "../../../utils/form/ha-form";
import { stateIcon } from "../../../utils/icons/state-icon";
import { SCENES_CARD_FIELDS, SCENES_CARD_SCRIPT_DOMAIN } from "../const";
import { SceneElement, ScriptConfig } from "../scene-editor-config";
import { computeEditorComponentName, LovelaceItemEditor } from "../utils";

const computeSchema = memoizeOne((icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: SCENES_CARD_SCRIPT_DOMAIN } } },
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
            { name: "icon_color", selector: { "mush-color": {} } },
            { name: "background_color", selector: { "mush-color": {} } },
        ],
    }
]);

@customElement(computeEditorComponentName("script"))
export class ScriptItemEditor extends LitElement implements LovelaceItemEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: ScriptConfig;

    public setConfig(config: ScriptConfig): void {
        this._config = config;
    }

    private _computeLabelCallback = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }        

        if (SCENES_CARD_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.scenes.${schema.name}`);
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
