import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "../../ha";
import setupCustomlocalize from "../../localize";
import "./../form/mushroom-select";

const LAYOUTS = ["default", "horizontal", "vertical"] as const;
type Layout = (typeof LAYOUTS)[number];

const ICONS: Record<Layout, string> = {
  default: "mdi:card-text-outline",
  vertical: "mdi:focus-field-vertical",
  horizontal: "mdi:focus-field-horizontal",
};

@customElement("mushroom-layout-picker")
export class LayoutPicker extends LitElement {
  @property() public label = "";

  @property() public value?: string;

  @property() public configValue = "";

  @property() public hass!: HomeAssistant;

  _selectChanged(ev) {
    const value = ev.target.value;
    if (value) {
      this.dispatchEvent(
        new CustomEvent("value-changed", {
          detail: {
            value: value !== "default" ? value : "",
          },
        })
      );
    }
  }

  render() {
    const customLocalize = setupCustomlocalize(this.hass);

    const value = this.value || "default";

    return html`
      <mushroom-select
        icon
        .label=${this.label}
        .configValue=${this.configValue}
        @selected=${this._selectChanged}
        @closed=${(e) => e.stopPropagation()}
        .value=${value}
        fixedMenuPosition
        naturalMenuWidth
      >
        <ha-icon slot="icon" .icon=${ICONS[value as Layout]}></ha-icon>
        ${LAYOUTS.map(
          (layout) => html`
            <mwc-list-item .value=${layout} graphic="icon">
              ${customLocalize(`editor.form.layout_picker.values.${layout}`)}
              <ha-icon slot="graphic" .icon=${ICONS[layout]}></ha-icon>
            </mwc-list-item>
          `
        )}
      </mushroom-select>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      mushroom-select {
        width: 100%;
      }
    `;
  }
}
