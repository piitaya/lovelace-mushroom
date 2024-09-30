import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fireEvent, HomeAssistant } from "../../../ha";
import "../../../shared/editor/height-picker";

export type MushHeightSelector = {
  mush_height: {};
};

@customElement("ha-selector-mush_height")
export class HaMushHeightSelector extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public selector!: MushHeightSelector;

  @property() public value?: string;

  @property() public label?: string;

  protected render() {
    return html`
      <mushroom-height-picker
        .hass=${this.hass}
        .label=${this.label}
        .value=${this.value}
        @value-changed=${this._valueChanged}
      ></mushroom-height-picker>
    `;
  }

  private _valueChanged(ev: CustomEvent) {
    fireEvent(this, "value-changed", { value: ev.detail.value || undefined });
  }
}
