import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, fireEvent } from "../../ha";
import setupCustomlocalize from "../../localize";
import { HaFormSchema } from "../../utils/form/ha-form";
import { LightColorFeatureConfig } from "./light-color-feature-config";

const SCHEMA: HaFormSchema[] = [
  {
    name: "show_hue",
    selector: { boolean: {} },
  },
  {
    name: "show_saturation",
    selector: { boolean: {} },
  },
];

@customElement("mushroom-light-color-card-feature-editor")
export class MushroomLightColorFeatureEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: LightColorFeatureConfig;

  public setConfig(config: LightColorFeatureConfig): void {
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);
    return customLocalize(`editor.card_feature.light_color.${schema.name}`);
  };

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }
}
