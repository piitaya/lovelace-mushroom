import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { LovelaceCardEditor, fireEvent } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { TEMPLATE_CARD_EDITOR_NAME } from "./const";
import {
  TemplateCardConfig,
  templateCardConfigStruct,
} from "./template-card-config";

export const TEMPLATE_LABELS = [
  "badge_icon",
  "badge_color",
  "content",
  "primary",
  "secondary",
  "multiline_secondary",
  "picture",
];

const SCHEMA: HaFormSchema[] = [
  { name: "entity", selector: { entity: {} } },
  {
    name: "icon",
    selector: { template: {} },
  },
  {
    name: "icon_color",
    selector: { template: {} },
  },
  {
    name: "primary",
    selector: { template: {} },
  },
  {
    name: "secondary",
    selector: { template: {} },
  },
  {
    name: "badge_icon",
    selector: { template: {} },
  },
  {
    name: "badge_color",
    selector: { template: {} },
  },
  {
    name: "picture",
    selector: { template: {} },
  },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "layout", selector: { mush_layout: {} } },
      { name: "fill_container", selector: { boolean: {} } },
      { name: "multiline_secondary", selector: { boolean: {} } },
    ],
  },
  ...computeActionsFormSchema(),
];

@customElement(TEMPLATE_CARD_EDITOR_NAME)
export class TemplateCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: TemplateCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: TemplateCardConfig): void {
    assert(config, templateCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (schema.name === "entity") {
      return `${this.hass!.localize(
        "ui.panel.lovelace.editor.card.generic.entity"
      )} (${customLocalize("editor.card.template.entity_extra")})`;
    }
    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    if (TEMPLATE_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.template.${schema.name}`);
    }
    return this.hass!.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
  };

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }
}
