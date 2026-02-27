import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { fireEvent, HomeAssistant, LocalizeFunc } from "../../../ha";
import setupCustomlocalize from "../../../localize";
import { computeActionsFormSchema } from "../../../shared/config/actions-config";
import { computeInfoOptions } from "../../../shared/config/appearance-config";
import { GENERIC_LABELS } from "../../../utils/form/generic-fields";
import { HaFormSchema } from "../../../utils/form/ha-form";
import { computeChipEditorComponentName } from "../../../utils/lovelace/chip/chip-element";
import { EntityChipConfig } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";

const computeSchema = memoizeOne((localize: LocalizeFunc): HaFormSchema[] => [
  { name: "entity", selector: { entity: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "name", selector: { text: {} } },
      {
        name: "content_info",
        selector: {
          select: {
            options: computeInfoOptions(localize),
            mode: "dropdown",
          },
        },
      },
    ],
  },
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
  { name: "use_entity_picture", selector: { boolean: {} } },
  ...computeActionsFormSchema(),
]);

@customElement(computeChipEditorComponentName("entity"))
export class EntityChipEditor extends LitElement implements LovelaceChipEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: EntityChipConfig;

  public setConfig(config: EntityChipConfig): void {
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

    const customLocalize = setupCustomlocalize(this.hass);
    const schema = computeSchema(customLocalize);

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
