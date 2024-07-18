import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { HomeAssistant } from "../../ha";
import setupCustomlocalize from "../../localize";
import { COLORS, computeColorName, computeRgbColor } from "../../utils/colors";
import "./../form/mushroom-select";

@customElement("mushroom-color-picker")
export class ColorPicker extends LitElement {
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

    return html`
      <mushroom-select
        .icon=${Boolean(this.value)}
        .label=${this.label}
        .configValue=${this.configValue}
        @selected=${this._selectChanged}
        @closed=${(e) => e.stopPropagation()}
        .value=${this.value || "default"}
        fixedMenuPosition
        naturalMenuWidth
      >
        <mwc-icon slot="icon"
          >${this.renderColorCircle(this.value || "grey")}</mwc-icon
        >
        <mwc-list-item value="default">
          ${customLocalize("editor.form.color_picker.values.default")}
        </mwc-list-item>
        ${COLORS.map(
          (color) => html`
            <mwc-list-item .value=${color} graphic="icon">
              ${computeColorName(color)}
              <mwc-icon slot="graphic"
                >${this.renderColorCircle(color)}</mwc-icon
              >
            </mwc-list-item>
          `
        )}
      </mushroom-select>
    `;
  }

  private renderColorCircle(color: string) {
    return html`
      <span
        class="circle-color"
        style=${styleMap({
          "--main-color": computeRgbColor(color),
        })}
      ></span>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      mushroom-select {
        width: 100%;
      }
      .circle-color {
        display: block;
        background-color: rgb(var(--main-color));
        border-radius: 10px;
        width: 20px;
        height: 20px;
      }
    `;
  }
}
