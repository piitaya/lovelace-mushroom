import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { HaFormSchema } from "../../../utils/form/ha-form";
import { computeChipEditorComponentName } from "../../../utils/lovelace/chip/chip-element";
import { EntityChipConfig } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { DEFAULT_MENU_ICON } from "./menu-chip";

const computeSchema = memoizeOne((icon?: string): HaFormSchema[] => [
    { name: "icon", selector: { icon: { placeholder: icon } } },
]);

@customElement(computeChipEditorComponentName("menu"))
export class MenuChipEditor extends LitElement implements LovelaceChipEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: EntityChipConfig;

    public setConfig(config: EntityChipConfig): void {
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const icon = this._config.icon || DEFAULT_MENU_ICON;
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
