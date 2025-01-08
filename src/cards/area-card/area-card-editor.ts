import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { HASSDomEvent, LovelaceCardEditor, fireEvent } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { AREA_CARD_EDITOR_NAME } from "./const";
import { APPEARANCE_FORM_SCHEMA } from "../../shared/config/appearance-config";
import { AreaCardConfig, areaCardConfigStruct } from "./area-card-config";
import {
  EditorTarget,
  EditSubElementEvent,
  SubElementEditorConfig,
} from "../../utils/lovelace/editor/types";
import { mdiGestureTap, mdiListBox, mdiPalette } from "@mdi/js";
import "./area-card-chips-editor";

const SCHEMA: HaFormSchema[] = [
  { name: "area", selector: { area: {} } },
  {
    name: "appearance",
    type: "expandable",
    flatten: true,
    iconPath: mdiPalette,
    schema: [
      { name: "name", selector: { text: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "icon",
            selector: { icon: {} },
          },
          { name: "icon_color", selector: { mush_color: {} } },
        ],
      },
      { name: "layout", selector: { mush_layout: {} } },
    ],
  },

  {
    name: "interactions",
    type: "expandable",
    flatten: true,
    iconPath: mdiGestureTap,
    schema: [...computeActionsFormSchema()],
  },
];

@customElement(AREA_CARD_EDITOR_NAME)
export class AreaCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: AreaCardConfig;

  @state() private _subElementEditorConfig?: SubElementEditorConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: AreaCardConfig): void {
    assert(config, areaCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    // if (schema.name === "entity") {
    //   return `${this.hass!.localize(
    //     "ui.panel.lovelace.editor.card.generic.entity"
    //   )} (${customLocalize("editor.card.template.entity_extra")})`;
    // }
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

    if (this._subElementEditorConfig) {
      return html`
        <mushroom-sub-element-editor
          .hass=${this.hass}
          .config=${this._subElementEditorConfig}
          @go-back=${this._goBack}
          @config-changed=${this._handleSubElementChanged}
        >
        </mushroom-sub-element-editor>
      `;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      >
      </ha-form>
      <ha-expansion-panel
        outlined
        style="margin-top: 1.5rem;border-radius: var(--ha-card-border-radius,6px);"
      >
        <div slot="header">
          <ha-svg-icon .path=${mdiListBox}></ha-svg-icon>
          ${this.hass!.localize(
            "ui.panel.lovelace.editor.card.generic.features"
          )}
        </div>
        <mushroom-area-card-chips-editor
          .hass=${this.hass}
          .chips=${this._config.chips}
          @chips-changed=${this._chipValueChanged}
          @edit-detail-element=${this._editDetailElement}
        ></mushroom-area-card-chips-editor>
      </ha-expansion-panel>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }

  private _chipValueChanged(ev: CustomEvent): void {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target! as EditorTarget;
    const configValue =
      target.configValue || this._subElementEditorConfig?.type;
    const value = target.checked ?? ev.detail.value ?? target.value;

    if (configValue === "chip" || (ev.detail && ev.detail.chips)) {
      const newConfigChips = ev.detail.chips || this._config!.chips.concat();
      if (configValue === "chip") {
        if (!value) {
          newConfigChips.splice(this._subElementEditorConfig!.index!, 1);
          this._goBack();
        } else {
          newConfigChips[this._subElementEditorConfig!.index!] = value;
        }

        this._subElementEditorConfig!.elementConfig = value;
      }

      this._config = { ...this._config!, chips: newConfigChips };
    } else if (configValue) {
      if (!value) {
        this._config = { ...this._config };
        delete this._config[configValue!];
      } else {
        this._config = {
          ...this._config,

          [configValue!]: value,
        };
      }
    }

    //this._config = { ...ev.detail.value, ...this._config };

    fireEvent(this, "config-changed", { config: this._config });
  }

  private _handleSubElementChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    const configValue = this._subElementEditorConfig?.type;
    const value = ev.detail.config;

    if (configValue === "chip") {
      const newConfigChips = this._config!.chips!.concat();
      if (!value) {
        newConfigChips.splice(this._subElementEditorConfig!.index!, 1);
        this._goBack();
      } else {
        newConfigChips[this._subElementEditorConfig!.index!] = value;
      }

      this._config = { ...this._config!, chips: newConfigChips };
    } else if (configValue) {
      if (value === "") {
        this._config = { ...this._config };
        delete this._config[configValue!];
      } else {
        this._config = {
          ...this._config,
          [configValue]: value,
        };
      }
    }

    this._subElementEditorConfig = {
      ...this._subElementEditorConfig!,
      elementConfig: value,
    };

    fireEvent(this, "config-changed", { config: this._config });
  }

  private _editDetailElement(ev: HASSDomEvent<EditSubElementEvent>): void {
    this._subElementEditorConfig = ev.detail.subElementConfig;
  }

  private _goBack(): void {
    this._subElementEditorConfig = undefined;
  }
}
