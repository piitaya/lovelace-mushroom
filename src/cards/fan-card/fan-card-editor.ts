import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { LocalizeFunc, LovelaceCardEditor, fireEvent } from "../../ha";
import { HassEntity } from "home-assistant-js-websocket";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { computeAppearanceFormSchema } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { computeNameSchema } from "../../utils/form/name-schema";
import { loadHaComponents } from "../../utils/loader";
import { FAN_CARD_EDITOR_NAME, FAN_ENTITY_DOMAINS } from "./const";
import { FanCardConfig, fanCardConfigStruct } from "./fan-card-config";
import {
  supportsDirectionControl,
  supportsOscillateControl,
  supportsPercentageControl,
} from "./utils";

const FAN_LABELS = [
  "icon_animation",
  "show_percentage_control",
  "show_oscillate_control",
  "show_direction_control",
];

const CONTROL_TOGGLES: {
  name: string;
  isSupported: (stateObj: HassEntity) => boolean;
}[] = [
  { name: "show_percentage_control", isSupported: supportsPercentageControl },
  { name: "show_oscillate_control", isSupported: supportsOscillateControl },
  { name: "show_direction_control", isSupported: supportsDirectionControl },
];

/**
 * Toggles worth offering for this entity.
 *
 * The card ignores a control the fan does not support, so its toggle would do
 * nothing. A toggle that is already enabled is kept, so an existing config
 * stays editable, and so is every toggle while the entity is missing or
 * reports no features yet.
 */
const computeToggles = (
  config: FanCardConfig,
  stateObj?: HassEntity
): string[] => {
  if (!stateObj?.attributes.supported_features) {
    return CONTROL_TOGGLES.map((toggle) => toggle.name);
  }
  return CONTROL_TOGGLES.filter(
    (toggle) => config[toggle.name] || toggle.isSupported(stateObj)
  ).map((toggle) => toggle.name);
};

const computeSchema = memoizeOne(
  (
    localize: LocalizeFunc,
    version: string,
    toggles: string
  ): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: FAN_ENTITY_DOMAINS } } },
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
        { name: "icon_animation", selector: { boolean: {} } },
      ],
    },
    ...computeAppearanceFormSchema(localize),
    {
      type: "grid",
      name: "",
      schema: [
        ...(toggles ? toggles.split(",") : []).map((name) => ({
          name,
          selector: { boolean: {} },
        })),
        { name: "collapsible_controls", selector: { boolean: {} } },
      ],
    },
    ...computeActionsFormSchema(),
  ]
);

@customElement(FAN_CARD_EDITOR_NAME)
export class FanCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: FanCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: FanCardConfig): void {
    assert(config, fanCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    if (FAN_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.fan.${schema.name}`);
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
    const stateObj = this._config.entity
      ? this.hass.states[this._config.entity]
      : undefined;
    const schema = computeSchema(
      customLocalize,
      this.hass.config.version,
      computeToggles(this._config, stateObj).join(",")
    );

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
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }
}
