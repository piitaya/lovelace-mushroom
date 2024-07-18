import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fireEvent, HomeAssistant } from "../../../ha";
import "../../../shared/editor/color-picker";

export type MushColorSelector = {
  mush_color: {};
};

@customElement("ha-selector-mush_color")
export class HaMushColorSelector extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public selector!: MushColorSelector;

  @property() public value?: string;

  @property() public label?: string;

  protected render() {
    return html`
      <mushroom-color-picker
        .hass=${this.hass}
        .label=${this.label}
        .value=${this.value}
        @value-changed=${this._valueChanged}
      ></mushroom-color-picker>
    `;
  }

  private _valueChanged(ev: CustomEvent) {
    fireEvent(this, "value-changed", { value: ev.detail.value || undefined });
  }
}
