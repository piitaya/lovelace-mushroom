import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { fireEvent, LovelaceCardEditor } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import { DROPDOWN_CARD_EDITOR_NAME } from "./const";
import { DropdownCardConfig, dropdownCardConfigStruct } from "./dropdown-card-config";

const DROPDOWN_CARD_FIELDS = ["default_open", "hide_arrow"];

const computeSchema = memoizeOne((icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: {} } },
    { name: "name", selector: { text: {} } },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "default_open", selector: { boolean: {} } },
            { name: "hide_arrow", selector: { boolean: {} } },
        ],
    },
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
            { name: "primary_info", selector: { "mush-info": {} } },
            { name: "secondary_info", selector: { "mush-info": {} } },
            { name: "icon_type", selector: { "mush-icon-type": {} } },
        ],
    },
    ...computeActionsFormSchema(),
    { name: "entities", selector: { entity: { multiple: true } } },
]);

@customElement(DROPDOWN_CARD_EDITOR_NAME)
export class DropdownCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: DropdownCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: DropdownCardConfig): void {
        assert(config, dropdownCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (DROPDOWN_CARD_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.dropdown.${schema.name}`);
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
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }
}
