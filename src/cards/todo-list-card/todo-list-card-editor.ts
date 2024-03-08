import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { fireEvent, LovelaceCardEditor } from "../../ha";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { TODO_LIST_CARD_EDITOR_NAME, TODO_LIST_ENTITY_DOMAINS } from "./const";
import { TodoListCardConfig, todoListCardConfigStruct } from "./todo-list-card-config";
import { computeActionsFormSchema } from "../../shared/config/actions-config";

export const TODO_LIST_LABELS = ["checked_icon", "unchecked_icon"];

const schema = [
    { name: "entity", selector: { entity: { domain: TODO_LIST_ENTITY_DOMAINS } } },
    { name: "name", selector: { text: {} } },
    { name: "icon", selector: { icon: {} } },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "layout", selector: { mush_layout: {} } },
            { name: "primary_info", selector: { mush_info: {} } },
            { name: "secondary_info", selector: { mush_info: {} } },
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
    ...computeActionsFormSchema(),
];

@customElement(TODO_LIST_CARD_EDITOR_NAME)
export class TodoListCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: TodoListCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: TodoListCardConfig): void {
        assert(config, todoListCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (TODO_LIST_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.todo_list.${schema.name}`);
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
