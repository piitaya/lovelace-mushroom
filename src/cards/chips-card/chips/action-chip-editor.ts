import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { fireEvent, HomeAssistant } from "../../../ha";
import setupCustomlocalize from "../../../localize";
import { computeActionsFormSchema } from "../../../shared/config/actions-config";
import { GENERIC_LABELS } from "../../../utils/form/generic-fields";
import { HaFormSchema } from "../../../utils/form/ha-form";
import { UiAction } from "../../../utils/form/ha-selector";
import { computeChipEditorComponentName } from "../../../utils/lovelace/chip/chip-element";
import { ActionChipConfig } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { DEFAULT_ACTION_ICON } from "./action-chip";

const actions: UiAction[] = [
  "navigate",
  "url",
  "perform-action",
  "assist",
  "none",
];

const computeSchema = memoizeOne((): HaFormSchema[] => [
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "icon",
        selector: { icon: { placeholder: DEFAULT_ACTION_ICON } },
      },
      { name: "icon_color", selector: { mush_color: {} } },
    ],
  },
  ...computeActionsFormSchema(actions),
]);

@customElement(computeChipEditorComponentName("action"))
export class EntityChipEditor extends LitElement implements LovelaceChipEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: ActionChipConfig;

  public setConfig(config: ActionChipConfig): void {
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
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
