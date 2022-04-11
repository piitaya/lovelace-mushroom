import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import setupCustomlocalize from "../../../localize";
import { configElementStyle } from "../../../utils/editor-styles";
import { GENERIC_FIELDS } from "../../../utils/form/fields";
import { HaFormSchema } from "../../../utils/form/ha-form";
import { stateIcon } from "../../../utils/icons/state-icon";
import { computeChipEditorComponentName } from "../../../utils/lovelace/chip/chip-element";
import { LovelaceSceneEditor } from "./scene-element-editor";

const computeSchema = memoizeOne((icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: {} } },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "name", selector: { text: {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "icon", selector: { icon: { placeholder: icon } } },
            { name: "icon_color", selector: { "mush-color": {} } },
            { name: "background_color", selector: { "mush-color": {} } },
        ],
    },
    { name: "tap_action", selector: { "mush-action": {} } },
    { name: "hold_action", selector: { "mush-action": {} } },
    { name: "double_tap_action", selector: { "mush-action": {} } },
]);

@customElement(computeChipEditorComponentName("entity"))
export class EntitySceneEditor extends LitElement implements LovelaceSceneEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: SceneCardConfig;

    public setConfig(config: SceneCardConfig): void {
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
