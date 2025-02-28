import { fireEvent, HomeAssistant } from "../../../ha";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../../shared/editor/icon-type-picker";

export type MushIconTypeSelector = {
  mush_icon_type: {};
};

@customElement("ha-selector-mush_icon_type")
export class HaMushIconTypeSelector extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public selector!: MushIconTypeSelector;

  @property() public value?: string;

  @property() public label?: string;

  protected render() {
    return html`
      <mushroom-icon-type-picker
        .hass=${this.hass}
        .label=${this.label}
        .value=${this.value}
        @value-changed=${this._valueChanged}
      ></mushroom-icon-type-picker>
    `;
  }

  private _valueChanged(ev: CustomEvent) {
    fireEvent(this, "value-changed", { value: ev.detail.value || undefined });
  }
}
