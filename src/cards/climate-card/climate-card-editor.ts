import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import {
  ClimateEntity,
  LocalizeFunc,
  LovelaceCardEditor,
  fireEvent,
} from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { computeAppearanceFormSchema } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { computeNameSchema } from "../../utils/form/name-schema";
import { loadHaComponents } from "../../utils/loader";
import {
  ClimateCardConfig,
  climateCardConfigStruct,
  HVAC_MODES,
} from "./climate-card-config";
import { CLIMATE_CARD_EDITOR_NAME, CLIMATE_ENTITY_DOMAINS } from "./const";

const CLIMATE_LABELS = [
  "hvac_modes",
  "preset_modes",
  "fan_modes",
  "swing_modes",
  "show_temperature_control",
] as string[];

const computeSchema = memoizeOne(
  (
    localize: LocalizeFunc,
    customLocalize: LocalizeFunc,
    version: string,
    presetModes: string[],
    fanModes: string[],
    swingModes: string[]
  ): HaFormSchema[] => [
    {
      name: "entity",
      selector: { entity: { domain: CLIMATE_ENTITY_DOMAINS } },
    },
    computeNameSchema(version),
    {
      name: "icon",
      selector: { icon: {} },
      context: { icon_entity: "entity" },
    },
    ...computeAppearanceFormSchema(customLocalize),
    {
      type: "grid",
      name: "",
      schema: [
        {
          name: "hvac_modes",
          selector: {
            select: {
              options: HVAC_MODES.map((mode) => ({
                value: mode,
                label: localize(
                  `component.climate.entity_component._.state.${mode}`
                ),
              })),
              mode: "dropdown",
              multiple: true,
            },
          },
        },
        {
          name: "preset_modes",
          selector: {
            select: {
              options: presetModes.map((mode) => ({
                value: mode,
                label:
                  localize(
                    `component.climate.entity_component._.state_attributes.preset_mode.state.${mode}`
                  ) || mode,
              })),
              mode: "dropdown",
              multiple: true,
            },
          },
        },
        {
          name: "fan_modes",
          selector: {
            select: {
              options: fanModes.map((mode) => ({
                value: mode,
                label:
                  localize(
                    `component.climate.entity_component._.state_attributes.fan_mode.state.${mode}`
                  ) || mode,
              })),
              mode: "dropdown",
              multiple: true,
            },
          },
        },
        {
          name: "swing_modes",
          selector: {
            select: {
              options: swingModes.map((mode) => ({
                value: mode,
                label:
                  localize(
                    `component.climate.entity_component._.state_attributes.swing_mode.state.${mode}`
                  ) || mode,
              })),
              mode: "dropdown",
              multiple: true,
            },
          },
        },
        { name: "show_temperature_control", selector: { boolean: {} } },
        { name: "collapsible_controls", selector: { boolean: {} } },
      ],
    },
    ...computeActionsFormSchema(),
  ]
);

@customElement(CLIMATE_CARD_EDITOR_NAME)
export class ClimateCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: ClimateCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: ClimateCardConfig): void {
    assert(config, climateCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    if (CLIMATE_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.climate.${schema.name}`);
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
      ? (this.hass.states[this._config.entity] as ClimateEntity)
      : undefined;
    const schema = computeSchema(
      this.hass!.localize,
      customLocalize,
      this.hass!.config.version,
      stateObj?.attributes.preset_modes ?? [],
      stateObj?.attributes.fan_modes ?? [],
      stateObj?.attributes.swing_modes ?? []
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
