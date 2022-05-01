import { fireEvent, LovelaceCardEditor } from "custom-card-helpers";
import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { atLeastHaVersion } from "../../ha/util";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { TEMPLATE_CARD_EDITOR_NAME } from "./const";
import { TemplateCardConfig, templateCardConfigStruct } from "./template-card-config";

export const TEMPLATE_LABELS = ["content", "primary", "secondary", "multiline_secondary"];

const computeSchema = memoizeOne((version: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: {} } },
    {
        name: "icon",
        selector: atLeastHaVersion(version, 2022, 5)
            ? { template: {} }
            : { text: { multiline: true } },
    },
    {
        name: "icon_color",
        selector: atLeastHaVersion(version, 2022, 5)
            ? { template: {} }
            : { text: { multiline: true } },
    },
    {
        name: "primary",
        selector: atLeastHaVersion(version, 2022, 5)
            ? { template: {} }
            : { text: { multiline: true } },
    },
    {
        name: "secondary",
        selector: atLeastHaVersion(version, 2022, 5)
            ? { template: {} }
            : { text: { multiline: true } },
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "layout", selector: { "mush-layout": {} } },
            { name: "fill_container", selector: { boolean: {} } },
            { name: "multiline_secondary", selector: { boolean: {} } },
        ],
    },
    { name: "tap_action", selector: { "mush-action": {} } },
    { name: "hold_action", selector: { "mush-action": {} } },
    { name: "double_tap_action", selector: { "mush-action": {} } },
]);

@customElement(TEMPLATE_CARD_EDITOR_NAME)
export class TemplateCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: TemplateCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: TemplateCardConfig): void {
        assert(config, templateCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (schema.name === "entity") {
            return `${this.hass!.localize(
                "ui.panel.lovelace.editor.card.generic.entity"
            )} (${customLocalize("editor.card.template.entity_extra")})`;
        }
        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (TEMPLATE_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.template.${schema.name}`);
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
                .schema=${computeSchema(this.hass!.connection.haVersion)}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }
}
