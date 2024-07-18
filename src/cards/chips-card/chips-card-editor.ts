import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  any,
  array,
  assert,
  assign,
  boolean,
  dynamic,
  literal,
  object,
  optional,
  string,
  union,
} from "superstruct";
import {
  actionConfigStruct,
  fireEvent,
  HASSDomEvent,
  LovelaceCardEditor,
} from "../../ha";
import setupCustomlocalize from "../../localize";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import "../../shared/editor/alignment-picker";
import { MushroomBaseElement } from "../../utils/base-element";
import { loadHaComponents } from "../../utils/loader";
import { LovelaceChipConfig } from "../../utils/lovelace/chip/types";
import {
  EditorTarget,
  EditSubElementEvent,
  SubElementEditorConfig,
} from "../../utils/lovelace/editor/types";
import "../../utils/lovelace/sub-element-editor";
import { ChipsCardConfig } from "./chips-card";
import "./chips-card-chips-editor";
import { CHIPS_CARD_EDITOR_NAME } from "./const";

const actionChipConfigStruct = object({
  type: literal("action"),
  icon: optional(string()),
  icon_color: optional(string()),
  tap_action: optional(actionConfigStruct),
  hold_action: optional(actionConfigStruct),
  double_tap_action: optional(actionConfigStruct),
});

const backChipConfigStruct = object({
  type: literal("back"),
  icon: optional(string()),
  icon_color: optional(string()),
});

const entityChipConfigStruct = object({
  type: literal("entity"),
  entity: optional(string()),
  name: optional(string()),
  content_info: optional(string()),
  icon: optional(string()),
  icon_color: optional(string()),
  use_entity_picture: optional(boolean()),
  tap_action: optional(actionConfigStruct),
  hold_action: optional(actionConfigStruct),
  double_tap_action: optional(actionConfigStruct),
});

const menuChipConfigStruct = object({
  type: literal("menu"),
  icon: optional(string()),
  icon_color: optional(string()),
});

const weatherChipConfigStruct = object({
  type: literal("weather"),
  entity: optional(string()),
  tap_action: optional(actionConfigStruct),
  hold_action: optional(actionConfigStruct),
  double_tap_action: optional(actionConfigStruct),
  show_temperature: optional(boolean()),
  show_conditions: optional(boolean()),
});

const conditionChipConfigStruct = object({
  type: literal("conditional"),
  chip: optional(any()),
  conditions: optional(array(any())),
});

const lightChipConfigStruct = object({
  type: literal("light"),
  entity: optional(string()),
  name: optional(string()),
  content_info: optional(string()),
  icon: optional(string()),
  use_light_color: optional(boolean()),
  tap_action: optional(actionConfigStruct),
  hold_action: optional(actionConfigStruct),
  double_tap_action: optional(actionConfigStruct),
});

const templateChipConfigStruct = object({
  type: literal("template"),
  entity: optional(string()),
  tap_action: optional(actionConfigStruct),
  hold_action: optional(actionConfigStruct),
  double_tap_action: optional(actionConfigStruct),
  content: optional(string()),
  icon: optional(string()),
  icon_color: optional(string()),
  picture: optional(string()),
  entity_id: optional(union([string(), array(string())])),
});

const spacerChipConfigStruct = object({
  type: literal("spacer"),
});

const chipsConfigStruct = dynamic<any>((value) => {
  if (value && typeof value === "object" && "type" in value) {
    switch ((value as LovelaceChipConfig).type!) {
      case "action":
        return actionChipConfigStruct;
      case "back":
        return backChipConfigStruct;
      case "entity":
        return entityChipConfigStruct;
      case "menu":
        return menuChipConfigStruct;
      case "weather":
        return weatherChipConfigStruct;
      case "conditional":
        return conditionChipConfigStruct;
      case "light":
        return lightChipConfigStruct;
      case "template":
        return templateChipConfigStruct;
      case "spacer":
        return spacerChipConfigStruct;
    }
  }
  return object();
});

const cardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    chips: array(chipsConfigStruct),
    alignment: optional(string()),
  })
);

@customElement(CHIPS_CARD_EDITOR_NAME)
export class ChipsCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: ChipsCardConfig;

  @state() private _subElementEditorConfig?: SubElementEditorConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: ChipsCardConfig): void {
    assert(config, cardConfigStruct);
    this._config = config;
  }

  get _title(): string {
    return this._config!.title || "";
  }

  get _theme(): string {
    return this._config!.theme || "";
  }

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

    const customLocalize = setupCustomlocalize(this.hass);

    return html`
      <div class="card-config">
        <mushroom-alignment-picker
          .label="${customLocalize(
            "editor.card.chips.alignment"
          )} (${this.hass.localize(
            "ui.panel.lovelace.editor.card.config.optional"
          )})"
          .hass=${this.hass}
          .value=${this._config.alignment}
          .configValue=${"alignment"}
          @value-changed=${this._valueChanged}
        >
        </mushroom-alignment-picker>
      </div>
      <mushroom-chips-card-chips-editor
        .hass=${this.hass}
        .chips=${this._config!.chips}
        @chips-changed=${this._valueChanged}
        @edit-detail-element=${this._editDetailElement}
      ></mushroom-chips-card-chips-editor>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
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
