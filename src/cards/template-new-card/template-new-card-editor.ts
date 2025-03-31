import { css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import {
  HASSDomEvent,
  LocalizeFunc,
  LovelaceCardEditor,
  fireEvent,
} from "../../ha";
import {
  LovelaceCardFeatureConfig,
  LovelaceCardFeatureContext,
} from "../../ha/panels/lovelace/card-features/types";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import {
  EditDetailElementEvent,
  EditSubElementEvent,
} from "../../utils/lovelace/editor/types";
import { TEMPLATE_CARD_NEW_EDITOR_NAME } from "./const";
import {
  TemplateNewCardConfig,
  templateNewCardConfigStruct,
} from "./template-new-card-config";

export const TEMPLATE_LABELS = [
  "badge",
  "badge_icon",
  "badge_color",
  "badge_text",
  "primary",
  "secondary",
  "multiline_secondary",
  "picture",
  "layout",
];

export const TILE_LABELS = [
  "content_layout",
  "vertical",
  "features_position",
  "icon_tap_action",
  "icon_hold_action",
  "icon_double_tap_action",
];

export const HELPERS = [
  "entity",
  "badge_text",
  "multiline_secondary",
  "picture",
];

@customElement(TEMPLATE_CARD_NEW_EDITOR_NAME)
export class TemplateCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: TemplateNewCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: TemplateNewCardConfig): void {
    assert(config, templateNewCardConfigStruct);
    this._config = config;
  }

  private _schema = memoizeOne(
    (localize: LocalizeFunc) =>
      [
        { name: "entity", selector: { entity: {} } },
        {
          name: "content",
          flatten: true,
          type: "expandable",
          icon: "mdi:text-short",
          schema: [
            { name: "primary", selector: { template: {} } },
            { name: "secondary", selector: { template: {} } },
            { name: "color", selector: { template: {} } },
            { name: "icon", selector: { template: {} } },
            { name: "picture", selector: { template: {} } },
          ],
        },
        {
          name: "badge",
          type: "expandable",
          flatten: true,
          icon: "mdi:square-rounded-badge-outline",

          schema: [
            { name: "badge_icon", selector: { template: {} } },
            { name: "badge_text", selector: { template: {} } },
            { name: "badge_color", selector: { template: {} } },
          ],
        },
        {
          name: "layout",
          type: "expandable",
          flatten: true,
          icon: "mdi:image-text",
          schema: [
            {
              name: "content_layout",
              required: true,
              selector: {
                select: {
                  mode: "box",
                  options: ["horizontal", "vertical"].map((value) => ({
                    label: localize(
                      `ui.panel.lovelace.editor.card.tile.content_layout_options.${value}`
                    ),
                    value,
                    image: {
                      src: `/static/images/form/tile_content_layout_${value}.svg`,
                      src_dark: `/static/images/form/tile_content_layout_${value}_dark.svg`,
                      flip_rtl: true,
                    },
                  })),
                },
              },
            },
            {
              name: "multiline_secondary",
              selector: { boolean: {} },
            },
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
              name: "icon_tap_action",
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
              schema: (
                [
                  "hold_action",
                  "icon_hold_action",
                  "double_tap_action",
                  "icon_double_tap_action",
                ] as const
              ).map((action) => ({
                name: action,
                selector: {
                  ui_action: {
                    default_action: "none" as const,
                  },
                },
              })),
            },
          ],
        },
      ] as const satisfies readonly HaFormSchema[]
  );

  private _featuresSchema = memoizeOne(
    (localize: LocalizeFunc, vertical: boolean) =>
      [
        {
          name: "features_position",
          required: true,
          selector: {
            select: {
              mode: "box",
              options: ["bottom", "inline"].map((value) => ({
                label: localize(
                  `ui.panel.lovelace.editor.card.tile.features_position_options.${value}`
                ),
                description: localize(
                  `ui.panel.lovelace.editor.card.tile.features_position_options.${value}_description`
                ),
                value,
                image: {
                  src: `/static/images/form/tile_features_position_${value}.svg`,
                  src_dark: `/static/images/form/tile_features_position_${value}_dark.svg`,
                  flip_rtl: true,
                },
                disabled: vertical && value === "inline",
              })),
            },
          },
        },
      ] as const satisfies readonly HaFormSchema[]
  );

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    if (TEMPLATE_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.template.${schema.name}`);
    }
    if (TILE_LABELS.includes(schema.name)) {
      return this.hass!.localize(
        `ui.panel.lovelace.editor.card.tile.${schema.name}`
      );
    }
    return this.hass!.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
  };

  private _computeHelper = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (HELPERS.includes(schema.name)) {
      return customLocalize(`editor.card.template.${schema.name}_helper`);
    }
    return undefined;
  };

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const schema = this._schema(this.hass.localize);

    const data = {
      ...this._config,
      content_layout: this._config.vertical ? "vertical" : "horizontal",
    };

    // Default features position to bottom and force it to bottom in vertical mode
    if (!data.features_position || data.vertical) {
      data.features_position = "bottom";
    }

    const featuresSchema = this._featuresSchema(
      this.hass.localize,
      data.content_layout === "vertical"
    );

    const entityId = this._config.entity;
    const stateObj = entityId ? this.hass!.states[entityId] : undefined;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${schema}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <ha-expansion-panel outlined>
        <ha-icon slot="leading-icon" icon="mdi:list-box"></ha-icon>
        <h3 slot="header">
          ${this.hass!.localize(
            "ui.panel.lovelace.editor.card.generic.features"
          )}
        </h3>
        <div class="content">
          <ha-form
            class="features-form"
            .hass=${this.hass}
            .data=${data}
            .schema=${featuresSchema}
            .computeLabel=${this._computeLabel}
            .computeHelper=${this._computeHelper}
            @value-changed=${this._valueChanged}
          ></ha-form>
          <hui-card-features-editor
            .hass=${this.hass}
            .stateObj=${stateObj}
            .features=${this._config!.features ?? []}
            @features-changed=${this._featuresChanged}
            @edit-detail-element=${this._editDetailElement}
          ></hui-card-features-editor>
        </div>
      </ha-expansion-panel>
    `;
  }

  private _featuresChanged(ev: CustomEvent) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    const features = ev.detail.features as LovelaceCardFeatureConfig[];
    const config: TemplateNewCardConfig = {
      ...this._config,
      features,
    };

    if (features.length === 0) {
      delete config.features;
    }

    fireEvent(this, "config-changed", { config });
  }

  private _editDetailElement(ev: HASSDomEvent<EditDetailElementEvent>): void {
    const index = ev.detail.subElementConfig.index;
    const config = this._config!.features![index!];

    fireEvent(this, "edit-sub-element", {
      config: config,
      saveConfig: (newConfig) => this._updateFeature(index!, newConfig),
      context: {
        entity_id: this._config!.entity,
      },
      type: "feature",
    } as EditSubElementEvent<
      LovelaceCardFeatureConfig,
      LovelaceCardFeatureContext
    >);
  }

  private _updateFeature(index: number, feature: LovelaceCardFeatureConfig) {
    const features = this._config!.features!.concat();
    features[index] = feature;
    const config = { ...this._config!, features };
    fireEvent(this, "config-changed", {
      config: config,
    });
  }

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    const newConfig = ev.detail.value as TemplateNewCardConfig;

    const config: TemplateNewCardConfig = {
      features: this._config.features,
      ...newConfig,
    };

    // Convert content_layout to vertical
    if (config.content_layout) {
      config.vertical = config.content_layout === "vertical";
      delete config.content_layout;
    }
    if (!config.vertical) {
      delete config.vertical;
    }

    fireEvent(this, "config-changed", { config });
  }

  static get styles() {
    return [
      css`
        ha-form {
          display: block;
          margin-bottom: 24px;
        }
        .features-form {
          margin-bottom: 8px;
        }
        ha-expansion-panel {
          display: block;
          --expansion-panel-content-padding: 0;
          border-radius: 6px;
          --ha-card-border-radius: 6px;
        }
        ha-expansion-panel .content {
          padding: 12px;
        }
        ha-expansion-panel > *[slot="header"] {
          margin: 0;
          font-size: inherit;
          font-weight: inherit;
        }
        ha-expansion-panel ha-icon {
          color: var(--secondary-text-color);
        }
      `,
    ];
  }
}
