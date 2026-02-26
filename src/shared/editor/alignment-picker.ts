import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  mdiFormatAlignCenter,
  mdiFormatAlignJustify,
  mdiFormatAlignLeft,
  mdiFormatAlignRight,
} from "@mdi/js";
import { HomeAssistant } from "../../ha";
import setupCustomlocalize from "../../localize";

const ALIGNMENT = ["default", "start", "center", "end", "justify"] as const;
type Alignment = (typeof ALIGNMENT)[number];

const ICONS: Record<Alignment, string> = {
  default: mdiFormatAlignLeft,
  start: mdiFormatAlignLeft,
  center: mdiFormatAlignCenter,
  end: mdiFormatAlignRight,
  justify: mdiFormatAlignJustify,
};

@customElement("mushroom-alignment-picker")
export class AlignmentPicker extends LitElement {
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

    const options = ALIGNMENT.map((alignment) => ({
      value: alignment,
      label: customLocalize(`editor.form.alignment_picker.values.${alignment}`),
      iconPath: ICONS[alignment],
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
