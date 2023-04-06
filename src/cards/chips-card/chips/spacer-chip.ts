import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import {
    computeChipComponentName,
    computeChipEditorComponentName,
} from "../../../utils/lovelace/chip/chip-element";
import { SpacerChipConfig, LovelaceChip } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";

@customElement(computeChipComponentName("spacer"))
export class SpacerChip extends LitElement implements LovelaceChip {
    public static async getConfigElement(): Promise<LovelaceChipEditor> {
        await import("./spacer-chip-editor");
        return document.createElement(
            computeChipEditorComponentName("spacer")
        ) as LovelaceChipEditor;
    }

    public static async getStubConfig(): Promise<SpacerChipConfig> {
        return { type: `spacer` };
    }

    public setConfig(): void {}

    protected render(): TemplateResult {
        return html`<div></div>`;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                flex-grow: 1;
            }
        `;
    }
}
