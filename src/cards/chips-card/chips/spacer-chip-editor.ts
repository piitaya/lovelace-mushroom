import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "../../../ha";
import setupCustomlocalize from "../../../localize";
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

        const customLocalize = setupCustomlocalize(this.hass!);

        return html`<div>${customLocalize(`editor.chip.no_config`)}</div>`;
    }

    static get styles(): CSSResultGroup {
        return css`
            div {
                margin-top: 20px;
            }
        `;
    }
}
