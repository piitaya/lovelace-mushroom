import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { LovelaceCardEditor, fireEvent } from "../../ha";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { HaFormSchema } from "../../utils/form/ha-form";
import { UiAction } from "../../utils/form/ha-selector";
import { loadHaComponents } from "../../utils/loader";
import { TITLE_CARD_EDITOR_NAME } from "./const";
import { TitleCardConfig, titleCardConfigStruct } from "./title-card-config";

const actions: UiAction[] = ["navigate", "url", "perform-action", "none"];
const TITLE_LABELS = [
  "title",
  "subtitle",
  "title_tap_action",
  "subtitle_tap_action",
];

const SCHEMA: HaFormSchema[] = [
  {
    name: "title",
    selector: { template: {} },
  },
  {
    name: "subtitle",
    selector: { template: {} },
  },
  { name: "alignment", selector: { mush_alignment: {} } },
  {
    name: "title_tap_action",
    selector: { ui_action: { actions } },
  },
  {
    name: "subtitle_tap_action",
    selector: { ui_action: { actions } },
  },
];

@customElement(TITLE_CARD_EDITOR_NAME)
export class TitleCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: TitleCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: TitleCardConfig): void {
    assert(config, titleCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (TITLE_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.title.${schema.name}`);
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
