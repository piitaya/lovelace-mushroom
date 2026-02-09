import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { fireEvent, LovelaceCardEditor } from "../../ha";
import setupCustomlocalize from "../../localize";
import { APPEARANCE_FORM_SCHEMA } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import {
  HumidifierCardConfig,
  humidifierCardConfigStruct,
} from "./humidifier-card-config";

@customElement("mushroom-humidifier-card-editor")
export class HumidifierCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: HumidifierCardConfig;

  connectedCallback() {
    super.connectedCallback();
  }

  public setConfig(config: HumidifierCardConfig): void {
    assert(config, humidifierCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    return customLocalize(`editor.card.humidifier.${schema.name}`);
  };

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const schema = [
      { name: "entity", selector: { entity: { domain: "humidifier" } } },
      { name: "name", selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
      {
        name: "layout",
        selector: { select: { options: ["vertical", "horizontal"] } },
      },
      { name: "show_target_humidity_control", selector: { boolean: {} } },
      { name: "show_mode_control", selector: { boolean: {} } },
      {
        name: "available_modes",
        selector: {
          select: {
            multiple: true,
            options: [
              "normal",
              "eco",
              "away",
              "boost",
              "comfort",
              "home",
              "sleep",
              "auto",
              "baby",
            ],
          },
        },
      },
      { name: "collapsible_controls", selector: { boolean: {} } },
      ...APPEARANCE_FORM_SCHEMA,
    ];

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    const config = ev.detail.value;
    fireEvent(this, "config-changed", { config });
  }
}
