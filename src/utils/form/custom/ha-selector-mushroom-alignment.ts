import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../../shared/editor/alignment-picker";

export type MushAlignementSelector = {
    "mush-alignment": {};
};

@customElement("ha-selector-mush-alignment")
export class HaMushAlignmentSelector extends LitElement {
    @property() public hass!: HomeAssistant;

    @property() public selector!: MushAlignementSelector;

    @property() public value?: string;

    @property() public label?: string;

    protected render() {
        return html`
            <mushroom-alignment-picker
                .hass=${this.hass}
                .label=${this.label}
                .value=${this.value}
                @value-changed=${this._valueChanged}
            ></mushroom-alignment-picker>
        `;
    }

    private _valueChanged(ev: CustomEvent) {
        fireEvent(this, "value-changed", { value: ev.detail.value || undefined });
    }
}
