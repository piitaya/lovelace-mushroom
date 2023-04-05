import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../../ha";
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

    public static async getStubConfig(hass: HomeAssistant): Promise<SpacerChipConfig> {
        const entities = Object.keys(hass.states);
        return {
            type: `spacer`,
        };
    }

    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: SpacerChipConfig;

    public setConfig(config: SpacerChipConfig): void {
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html`<div></div>`;
        }

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
