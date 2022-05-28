import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../../shared/editor/icon-info-picker";

export type MushIconInfoSelector = {
    "mush-icon-info": {};
};

@customElement("ha-selector-mush-icon-info")
export class HaMushIconInfoSelector extends LitElement {
    @property() public hass!: HomeAssistant;

    @property() public selector!: MushIconInfoSelector;

    @property() public value?: string;

    @property() public label?: string;

    protected render() {
        return html`
            <mushroom-icon-info-picker
                .hass=${this.hass}
                .label=${this.label}
                .value=${this.value}
                @value-changed=${this._valueChanged}
            ></mushroom-icon-info-picker>
        `;
    }

    private _valueChanged(ev: CustomEvent) {
        fireEvent(this, "value-changed", { value: ev.detail.value || undefined });
    }
}
