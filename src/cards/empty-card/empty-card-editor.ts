import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { LovelaceCardEditor } from "../../ha";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { HaFormSchema } from "../../utils/form/ha-form";
import { EMPTY_CARD_EDITOR_NAME } from "./const";
import { EmptyCardConfig } from "./empty-card-config";

const SCHEMA: HaFormSchema[] = [
  {
    name: "description",
    type: "constant",
  }
];

@customElement(EMPTY_CARD_EDITOR_NAME)
export class EntityCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
  @state() private _config?: EmptyCardConfig;

  public setConfig(): void {
    // No config necessary
  }

  protected render() {
    const customLocalize = setupCustomlocalize(this.hass);

    return html`
      <p>${customLocalize("editor.card.empty.no_config_options")}</p>
    `;
  }
}
