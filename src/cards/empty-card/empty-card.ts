import { css, CSSResultGroup, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  LovelaceCard,
  LovelaceCardEditor,
  type LovelaceGridOptions,
} from "../../ha";
import { MushroomBaseElement } from "../../utils/base-element";
import { registerCustomCard } from "../../utils/custom-cards";
import { EMPTY_CARD_EDITOR_NAME, EMPTY_CARD_NAME } from "./const";

registerCustomCard({
  type: EMPTY_CARD_NAME,
  name: "Mushroom Empty Card",
  description:
    "The empty card allows you to add a placeholder between your cards.",
});

@customElement(EMPTY_CARD_NAME)
export class EmptyCard extends MushroomBaseElement implements LovelaceCard {
  @property({ type: Boolean }) public preview = false;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./empty-card-editor");
    return document.createElement(EMPTY_CARD_EDITOR_NAME) as LovelaceCardEditor;
  }

  public getCardSize(): number {
    return 1;
  }

  public getGridOptions(): LovelaceGridOptions {
    return {
      rows: 1,
      columns: 6,
    };
  }

  public setConfig(): void {
    // No config necessary
  }

  protected render() {
    if (!this.preview) {
      return nothing;
    }

    return html`
      <ha-card>
        <ha-icon icon="mdi:dots-horizontal"></ha-icon>
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      css`
        :host {
          display: block;
          height: 100%;
        }

        ha-card {
          background: none;
          height: 100%;
          min-height: 56px;
          display: flex;
          justify-content: center;
          align-items: center;
          --mdc-icon-size: 40px;
          --icon-primary-color: var(--divider-color, rgba(0, 0, 0, 0.12));
        }
      `,
    ];
  }
}
