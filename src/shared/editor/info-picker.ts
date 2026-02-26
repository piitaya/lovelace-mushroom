import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "../../ha";
import setupCustomlocalize from "../../localize";
import { Info, INFOS } from "../../utils/info";

@customElement("mushroom-info-picker")
export class InfoPicker extends LitElement {
  @property() public label = "";

  @property() public value?: string;

  @property() public configValue = "";

  @property() public infos?: Info[];

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
        label: customLocalize("editor.form.info_picker.values.default"),
      },
      ...(this.infos ?? INFOS).map((info) => ({
        value: info,
        label:
          customLocalize(`editor.form.info_picker.values.${info}`) ||
          capitalizeFirstLetter(info),
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

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
