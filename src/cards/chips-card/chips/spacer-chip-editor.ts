import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "../../../ha";
import { computeChipEditorComponentName } from "../../../utils/lovelace/chip/chip-element";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";

@customElement(computeChipEditorComponentName("spacer"))
export class SpacerChipEditor extends LitElement implements LovelaceChipEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    public setConfig(): void {}

    protected render(): TemplateResult {
        if (!this.hass) {
            return html``;
        }
        
        return html`<div>There are currently no config options for this chip.</div>`;
    }

    static get styles(): CSSResultGroup {
        return css`
            div {
                margin-top: 20px;
            }
        `;
    }
}
