import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "../../ha";
import setupCustomlocalize from "../../localize";
import "./../form/mushroom-select";

const ALIGNMENT = ["default", "start", "center", "end", "justify"] as const;
type Alignment = (typeof ALIGNMENT)[number];

const ICONS: Record<Alignment, string> = {
  default: "mdi:format-align-left",
  start: "mdi:format-align-left",
  center: "mdi:format-align-center",
  end: "mdi:format-align-right",
  justify: "mdi:format-align-justify",
};

@customElement("mushroom-alignment-picker")
export class AlignmentPicker extends LitElement {
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
        .value=${this.value || "default"}
        fixedMenuPosition
        naturalMenuWidth
      >
        <ha-icon slot="icon" .icon=${ICONS[value as Alignment]}></ha-icon>
        ${ALIGNMENT.map((alignment) => {
          return html`
            <mwc-list-item .value=${alignment} graphic="icon">
              ${customLocalize(
                `editor.form.alignment_picker.values.${alignment}`
              )}
              <ha-icon slot="graphic" .icon=${ICONS[alignment]}></ha-icon>
            </mwc-list-item>
          `;
        })}
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
