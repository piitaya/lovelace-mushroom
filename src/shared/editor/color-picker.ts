import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { HomeAssistant } from "../../ha";
import setupCustomlocalize from "../../localize";
import { COLORS, computeColorName, computeRgbColor } from "../../utils/colors";

@customElement("mushroom-color-picker")
export class ColorPicker extends LitElement {
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

    const options = [
      {
        value: "default",
        label: customLocalize("editor.form.color_picker.values.default"),
      },
      ...COLORS.map((color) => ({
        value: color,
        label: computeColorName(color),
      })),
    ];

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
