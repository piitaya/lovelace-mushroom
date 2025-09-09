import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { fireEvent, LovelaceBadgeEditor, type HomeAssistant } from "../../ha";
import setupCustomlocalize from "../../localize";
import {
  GENERIC_HELPERS,
  GENERIC_LABELS,
} from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import {
  TemplateBadgeConfig,
  templateBadgeConfigStruct,
} from "./template-badge-config";

export const TEMPLATE_BADGE_LABELS = ["label", "content"];

export const TEMPLATE_BADGE_HELPERS = ["area", "entity"];

const SCHEMA = [
  {
    name: "context",
    flatten: true,
    type: "expandable",
    icon: "mdi:shape",
    schema: [
      { name: "entity", selector: { entity: {} } },
      { name: "area", selector: { area: {} } },
    ],
  },
  {
    name: "content",
    flatten: true,
    type: "expandable",
    icon: "mdi:text-short",
    schema: [
      { name: "label", selector: { template: {} } },
      { name: "content", selector: { template: {} } },
      { name: "color", selector: { template: {} } },
      { name: "icon", selector: { template: {} } },
      { name: "picture", selector: { template: {} } },
    ],
  },
  {
    name: "interactions",
    type: "expandable",
    flatten: true,
    icon: "mdi:gesture-tap",
    schema: [
      {
        name: "tap_action",
        selector: {
          ui_action: {
            default_action: "none",
          },
        },
      },
      {
        name: "",
        type: "optional_actions",
        flatten: true,
        schema: (["hold_action", "double_tap_action"] as const).map(
          (action) => ({
            name: action,
            selector: {
              ui_action: {
                default_action: "none" as const,
              },
            },
          })
        ),
      },
    ],
  },
] as const satisfies readonly HaFormSchema[];

@customElement("mushroom-template-badge-editor")
export class MushroomTemplateBadgeEditor
  extends LitElement
  implements LovelaceBadgeEditor
{
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: TemplateBadgeConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: TemplateBadgeConfig): void {
    assert(config, templateBadgeConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (schema.type === "expandable") {
      return customLocalize(`editor.section.${schema.name}`);
    }
    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    if (TEMPLATE_BADGE_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.template.${schema.name}`);
    }
    return this.hass!.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
  };

  private _computeHelper = (schema: HaFormSchema) => {
    if (schema.type === "expandable") {
      return undefined;
    }
    const customLocalize = setupCustomlocalize(this.hass!);
    if (GENERIC_HELPERS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}_helper`);
    }
    if (TEMPLATE_BADGE_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.template.${schema.name}_helper`);
    }
    return undefined;
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
        .computeHelper=${this._computeHelper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mushroom-template-badge-editor": MushroomTemplateBadgeEditor;
  }
}
