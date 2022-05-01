import { fireEvent, LovelaceCardEditor } from "custom-card-helpers";
import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { atLeastHaVersion } from "../../ha/util";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { TITLE_CARD_EDITOR_NAME } from "./const";
import { TitleCardConfig, titleCardConfigStruct } from "./title-card-config";

const TITLE_LABELS = ["title", "subtitle"];

const computeSchema = memoizeOne((version: string): HaFormSchema[] => [
    {
        name: "title",
        selector: atLeastHaVersion(version, 2022, 5)
            ? { template: {} }
            : { text: { multiline: true } },
    },
    {
        name: "subtitle",
        selector: atLeastHaVersion(version, 2022, 5)
            ? { template: {} }
            : { text: { multiline: true } },
    },
    { name: "alignment", selector: { "mush-alignment": {} } },
]);

@customElement(TITLE_CARD_EDITOR_NAME)
export class TitleCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: TitleCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: TitleCardConfig): void {
        assert(config, titleCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (TITLE_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.title.${schema.name}`);
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
