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
import { UiAction } from "../../utils/form/ha-selector";
import { loadHaComponents } from "../../utils/loader";
import {
  AlarmControlPanelCardConfig,
  alarmControlPanelCardCardConfigStruct,
} from "./alarm-control-panel-card-config";
import {
  ALARM_CONTROl_PANEL_CARD_EDITOR_NAME,
  ALARM_CONTROl_PANEL_ENTITY_DOMAINS,
} from "./const";

const actions: UiAction[] = [
  "more-info",
  "navigate",
  "url",
  "perform-action",
  "assist",
  "none",
];

const states = [
  "armed_home",
  "armed_away",
  "armed_night",
  "armed_vacation",
  "armed_custom_bypass",
];

const computeSchema = memoizeOne((localize: LocalizeFunc): HaFormSchema[] => [
  {
    name: "entity",
    selector: { entity: { domain: ALARM_CONTROl_PANEL_ENTITY_DOMAINS } },
  },
  { name: "name", selector: { text: {} } },
  {
    name: "icon",
    selector: { icon: {} },
    context: { icon_entity: "entity" },
  },
  ...APPEARANCE_FORM_SCHEMA,
  {
    type: "multi_select",
    name: "states",
    options: states.map((state) => [
      state,
      localize(`ui.card.alarm_control_panel.${state.replace("armed", "arm")}`),
    ]) as [string, string][],
  },
  ...computeActionsFormSchema(actions),
]);

@customElement(ALARM_CONTROl_PANEL_CARD_EDITOR_NAME)
export class SwitchCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: AlarmControlPanelCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: AlarmControlPanelCardConfig): void {
    assert(config, alarmControlPanelCardCardConfigStruct);
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const schema = computeSchema(this.hass!.localize);

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

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    if (schema.name === "states") {
      return this.hass!.localize(
        "ui.panel.lovelace.editor.card.alarm-panel.available_states"
      );
    }

    return this.hass!.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
  };

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }
}
