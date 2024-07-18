import { css, CSSResultGroup, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { LovelaceChip } from "../../../utils/lovelace/chip/types";
import { computeChipComponentName } from "../../../utils/lovelace/chip/chip-element";

@customElement(computeChipComponentName("spacer"))
export class SpacerChip extends LitElement implements LovelaceChip {
  public setConfig(): void {}

  static get styles(): CSSResultGroup {
    return css`
      :host {
        flex-grow: 1;
      }
    `;
  }
}
