import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { assert } from "superstruct";
import { LovelaceCardEditor } from "../../ha";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { EMPTY_CARD_EDITOR_NAME } from "./const";
import { EmptyCardConfig, emptyCardConfigStruct } from "./empty-card-config";

const SCHEMA: HaFormSchema[] = [
  {
    name: "description",
    type: "constant",
  }
];

@customElement(EMPTY_CARD_EDITOR_NAME)
export class EntityCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
  @state() private _config?: EmptyCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(): void {
    // No config necessary
  }

  private _computeLabel = () => {
    const customLocalize = setupCustomlocalize(this.hass!);

    return customLocalize("editor.card.empty.no_config_options");
  };

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${{}}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
      ></ha-form>
    `;
  }
}
