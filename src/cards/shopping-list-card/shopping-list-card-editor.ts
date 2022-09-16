import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { fireEvent, LovelaceCardEditor } from "../../ha";
import setupCustomlocalize from "../../localize";
import { APPEARANCE_FORM_SCHEMA } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { SHOPPING_LIST_CARD_EDITOR_NAME } from "./const";
import { ShoppingListCardConfig, shoppingListCardConfigStruct } from "./shopping-list-card-config";

export const SHOPPING_LIST_LABELS = ["checked_icon", "unchecked_icon"];

const schema = [
    { name: "name", selector: { text: {} } },
    { name: "icon", selector: { icon: {} } },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "layout", selector: { "mush-layout": {} } },
            { name: "primary_info", selector: { "mush-info": {} } },
            { name: "secondary_info", selector: { "mush-info": {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "unchecked_icon", selector: { icon: {} } },
            { name: "checked_icon", selector: { icon: {} } },
        ],
    },
];

@customElement(SHOPPING_LIST_CARD_EDITOR_NAME)
export class ShoppingListCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: ShoppingListCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: ShoppingListCardConfig): void {
        assert(config, shoppingListCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (SHOPPING_LIST_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.shopping_list.${schema.name}`);
        }
        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

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
