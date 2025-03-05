import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { LovelaceCardEditor, fireEvent } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { APPEARANCE_FORM_SCHEMA } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { UiAction } from "../../utils/form/ha-selector";
import { loadHaComponents } from "../../utils/loader";
import { UPDATE_CARD_EDITOR_NAME, UPDATE_ENTITY_DOMAINS } from "./const";
import { UpdateCardConfig, updateCardConfigStruct } from "./update-card-config";

const UPDATE_LABELS = ["show_buttons_control"];

const actions: UiAction[] = [
  "more-info",
  "navigate",
  "url",
  "perform-action",
  "assist",
  "none",
];

const computeSchema = memoizeOne((): HaFormSchema[] => [
  { name: "entity", selector: { entity: { domain: UPDATE_ENTITY_DOMAINS } } },
  { name: "name", selector: { text: {} } },
  { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
  ...APPEARANCE_FORM_SCHEMA,
  {
    type: "grid",
    name: "",
    schema: [
      { name: "show_buttons_control", selector: { boolean: {} } },
      { name: "collapsible_controls", selector: { boolean: {} } },
    ],
  },
  ...computeActionsFormSchema(actions),
]);

@customElement(UPDATE_CARD_EDITOR_NAME)
export class UpdateCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: UpdateCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: UpdateCardConfig): void {
    assert(config, updateCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    if (UPDATE_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.update.${schema.name}`);
    }
    return this.hass!.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
  };

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const schema = computeSchema();

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
