import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  mdiCardTextOutline,
  mdiFocusFieldHorizontal,
  mdiFocusFieldVertical,
} from "@mdi/js";
import { HomeAssistant } from "../../ha";
import setupCustomlocalize from "../../localize";

const LAYOUTS = ["default", "horizontal", "vertical"] as const;
type Layout = (typeof LAYOUTS)[number];

const ICONS: Record<Layout, string> = {
  default: mdiCardTextOutline,
  horizontal: mdiFocusFieldHorizontal,
  vertical: mdiFocusFieldVertical,
};

@customElement("mushroom-layout-picker")
export class LayoutPicker extends LitElement {
  @property() public label = "";

  @property() public value?: string;

  @property() public configValue = "";

  @property() public hass!: HomeAssistant;

  _selectChanged(ev: CustomEvent<{ value?: string }>) {
    const value = ev.detail.value;
    if (value !== undefined) {
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

    const options = LAYOUTS.map((layout) => ({
      value: layout,
      label: customLocalize(`editor.form.layout_picker.values.${layout}`),
      iconPath: ICONS[layout],
    }));

    return html`
      <ha-select
        .label=${this.label}
        .value=${this.value || "default"}
        .options=${options}
        @selected=${this._selectChanged}
      ></ha-select>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      ha-select {
        width: 100%;
      }
    `;
  }
}
