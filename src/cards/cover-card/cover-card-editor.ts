import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import {
  CoverEntity,
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
import { COVER_CARD_EDITOR_NAME, COVER_ENTITY_DOMAINS } from "./const";
import { CoverCardConfig, coverCardConfigStruct } from "./cover-card-config";
import {
  supportsButtonsControl,
  supportsPositionControl,
  supportsTiltPositionControl,
} from "./utils";

const COVER_LABELS = [
  "show_buttons_control",
  "show_position_control",
  "show_tilt_position_control",
];

const CONTROL_TOGGLES: {
  name: string;
  isSupported: (entity: CoverEntity) => boolean;
}[] = [
  { name: "show_position_control", isSupported: supportsPositionControl },
  {
    name: "show_tilt_position_control",
    isSupported: supportsTiltPositionControl,
  },
  { name: "show_buttons_control", isSupported: supportsButtonsControl },
];

/**
 * Toggles worth offering for this entity.
 *
 * The card ignores a control the entity does not support, so its toggle would
 * do nothing. A toggle that is already enabled is kept, so an existing config
 * stays editable, and so is every toggle while the entity is missing or
 * reports no features yet.
 */
const computeToggles = (
  config: CoverCardConfig,
  stateObj?: CoverEntity
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
    { name: "entity", selector: { entity: { domain: COVER_ENTITY_DOMAINS } } },
    computeNameSchema(version),
    {
      name: "icon",
      selector: { icon: {} },
      context: { icon_entity: "entity" },
    },
    ...computeAppearanceFormSchema(localize),
    {
      type: "grid",
      name: "",
      schema: (toggles ? toggles.split(",") : []).map((name) => ({
        name,
        selector: { boolean: {} },
      })),
    },
    ...computeActionsFormSchema(),
  ]
);

@customElement(COVER_CARD_EDITOR_NAME)
export class CoverCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: CoverCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: CoverCardConfig): void {
    assert(config, coverCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    if (COVER_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.cover.${schema.name}`);
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
      ? (this.hass.states[this._config.entity] as CoverEntity | undefined)
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
