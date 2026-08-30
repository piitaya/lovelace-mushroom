import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { LocalizeFunc, LovelaceCardEditor, fireEvent } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { computeAppearanceFormSchema } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { computeNameSchema } from "../../utils/form/name-schema";
import { loadHaComponents } from "../../utils/loader";
import { COVER_CARD_EDITOR_NAME, COVER_ENTITY_DOMAINS } from "./const";
import {
  COVER_CONTROLS,
  CoverCardConfig,
  CoverCardControl,
  coverCardConfigStruct,
} from "./cover-card-config";

const COVER_LABELS = [
  "show_buttons_control",
  "show_position_control",
  "show_tilt_position_control",
  "default_control",
];

// Placeholder value used in the editor when `default_control` is not set
const DEFAULT_CONTROL_AUTO = "auto";

const CONTROL_TOGGLES: Record<CoverCardControl, string> = {
  buttons_control: "show_buttons_control",
  position_control: "show_position_control",
  tilt_position_control: "show_tilt_position_control",
};

const computeEnabledControls = (config: CoverCardConfig): CoverCardControl[] =>
  COVER_CONTROLS.filter((control) => config[CONTROL_TOGGLES[control]]);

const computeSchema = memoizeOne(
  (
    localize: LocalizeFunc,
    version: string,
    enabledControls: string
  ): HaFormSchema[] => {
    const controls = enabledControls ? enabledControls.split(",") : [];
    return [
      {
        name: "entity",
        selector: { entity: { domain: COVER_ENTITY_DOMAINS } },
      },
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
        schema: [
          { name: "show_position_control", selector: { boolean: {} } },
          { name: "show_tilt_position_control", selector: { boolean: {} } },
          { name: "show_buttons_control", selector: { boolean: {} } },
        ],
      },
      // Nothing to pick from until at least two controls are enabled
      ...(controls.length > 1
        ? ([
            {
              name: "default_control",
              selector: {
                select: {
                  options: [DEFAULT_CONTROL_AUTO, ...controls].map(
                    (control) => ({
                      value: control,
                      label: localize(
                        `editor.card.cover.default_control_list.${control}`
                      ),
                    })
                  ),
                  mode: "dropdown",
                },
              },
            },
          ] as HaFormSchema[])
        : []),
      ...computeActionsFormSchema(),
    ];
  }
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
    const enabledControls = computeEnabledControls(this._config);
    const schema = computeSchema(
      customLocalize,
      this.hass.config.version,
      enabledControls.join(",")
    );

    // A default control that is not enabled is ignored by the card, so show
    // the placeholder instead of a value the dropdown cannot offer
    const data = { ...this._config } as any;
    if (!enabledControls.includes(data.default_control)) {
      data.default_control = DEFAULT_CONTROL_AUTO;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    const config = { ...ev.detail.value };

    if (config.default_control === DEFAULT_CONTROL_AUTO) {
      delete config.default_control;
    }

    fireEvent(this, "config-changed", { config });
  }
}
