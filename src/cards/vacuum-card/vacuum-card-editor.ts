import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { LocalizeFunc, LovelaceCardEditor, fireEvent } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { APPEARANCE_FORM_SCHEMA } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { VACUUM_CARD_EDITOR_NAME, VACUUM_ENTITY_DOMAINS } from "./const";
import {
  VACUUM_COMMANDS,
  VacuumCardConfig,
  vacuumCardConfigStruct,
} from "./vacuum-card-config";

const VACUUM_LABELS = ["commands"];

const computeSchema = memoizeOne(
  (localize: LocalizeFunc, customLocalize: LocalizeFunc): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: VACUUM_ENTITY_DOMAINS } } },
    { name: "name", selector: { text: {} } },
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
    ...APPEARANCE_FORM_SCHEMA,
    {
      name: "commands",
      selector: {
        select: {
          mode: "list",
          multiple: true,
          options: VACUUM_COMMANDS.map((command) => ({
            value: command,
            label:
              command === "on_off"
                ? customLocalize(`editor.card.vacuum.commands_list.${command}`)
                : localize(`ui.dialogs.more_info_control.vacuum.${command}`),
          })),
        },
      },
    },
    ...computeActionsFormSchema(),
  ]
);

@customElement(VACUUM_CARD_EDITOR_NAME)
export class VacuumCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: VacuumCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: VacuumCardConfig): void {
    assert(config, vacuumCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    if (VACUUM_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.vacuum.${schema.name}`);
    }
    return this.hass!.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
  };

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const customLocalize = setupCustomlocalize(this.hass!);
    const schema = computeSchema(this.hass!.localize, customLocalize);

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
