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
import { BAR_CARD_EDITOR_NAME, BAR_ENTITY_DOMAINS } from "./const";
import {
  BarCardConfig,
  BarCardConfigStruct,
  COLOR_SEVERITY_DIRECTION,
} from "./bar-card-config";

export const BAR_LABELS = ["min", "max", "enable_color_severity", "severity_direction"];

const computeSchema = memoizeOne((localize: LocalizeFunc): HaFormSchema[] => [
  { name: "entity", selector: { entity: { domain: BAR_ENTITY_DOMAINS } } },
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
      { name: "icon_color", selector: { mush_color: {} } },
      { name: "min", selector: { number: {} } },
      { name: "max", selector: { number: {} } },
      { name: "enable_color_severity", selector: { boolean: {}}},
      {
        name: "severity_direction",
        selector: {
          select: {
            options: ["default", ...COLOR_SEVERITY_DIRECTION].map((control) => ({
              value: control,
              label: localize(`editor.card.bar.severity_direction_list.${control}`),
            })),
            mode: "dropdown",
          },
        },
      },
    ],
  },
  ...APPEARANCE_FORM_SCHEMA,
  ...computeActionsFormSchema(),
]);

@customElement(BAR_CARD_EDITOR_NAME)
export class BarCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: BarCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: BarCardConfig): void {
    assert(config, BarCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (BAR_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.bar.${schema.name}`);
    }

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

    const data = { ...this._config } as any;

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

    if (config.severity_direction === "default") {
      delete config.severity_direction;
    }

    fireEvent(this, "config-changed", { config });
  }
}
