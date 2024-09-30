import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { HomeAssistant } from "../../ha";
import setupCustomlocalize from "../../localize";
import { Heights } from "../../utils/height";
import "./../form/mushroom-select";

@customElement("mushroom-height-picker")
export class HeightPicker extends LitElement {
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
        <mwc-list-item value="default">
          ${customLocalize("Default height")}
        </mwc-list-item>
        ${Heights.map(
          (h) => html`
            <mwc-list-item .value=${h} graphic="icon">${h}</mwc-list-item>
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
