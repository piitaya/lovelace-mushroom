import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { LocalizeFunc, LovelaceCardEditor, fireEvent } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { computeAppearanceFormSchema } from "../../shared/config/appearance-config";
import "../../shared/editor/migrate-to-tile";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { computeNameSchema } from "../../utils/form/name-schema";
import { loadHaComponents } from "../../utils/loader";
import { LIGHT_CARD_EDITOR_NAME, LIGHT_ENTITY_DOMAINS } from "./const";
import { LightCardConfig, lightCardConfigStruct } from "./light-card-config";

export const LIGHT_LABELS = [
  "show_brightness_control",
  "use_light_color",
  "show_color_temp_control",
  "show_color_control",
];

const computeSchema = memoizeOne(
  (localize: LocalizeFunc, version: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: LIGHT_ENTITY_DOMAINS } } },
    computeNameSchema(version),
    {
      type: "grid",
      name: "",
      schema: [
        {
          name: "icon",
          selector: { icon: {} },
          context: { icon_entity: "entity" },
        },
        { name: "icon_color", selector: { ui_color: {} } },
      ],
    },
    ...computeAppearanceFormSchema(localize),
    {
      type: "grid",
      name: "",
      schema: [
        { name: "use_light_color", selector: { boolean: {} } },
        { name: "show_brightness_control", selector: { boolean: {} } },
        { name: "show_color_temp_control", selector: { boolean: {} } },
        { name: "show_color_control", selector: { boolean: {} } },
        { name: "collapsible_controls", selector: { boolean: {} } },
      ],
    },
    ...computeActionsFormSchema(),
  ]
);

@customElement(LIGHT_CARD_EDITOR_NAME)
export class LightCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: LightCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: LightCardConfig): void {
    assert(config, lightCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    if (LIGHT_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.light.${schema.name}`);
    }
    return this.hass!.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
  };

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const customLocalize = setupCustomlocalize(this.hass);
    const schema = computeSchema(customLocalize, this.hass.config.version);

    return html`
      <mushroom-migrate-to-tile
        .hass=${this.hass}
        .config=${this._config}
      ></mushroom-migrate-to-tile>
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
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }
}
