import { HomeAssistant } from "custom-card-helpers";
import { customElement } from "lit/decorators.js";
import { ConditionalBase } from "../../../utils/conditional/conditional-base";
import {
    computeChipComponentName,
    computeChipEditorComponentName,
    createChipElement,
} from "../../../utils/lovelace/chip/chip-element";
import { ConditionalChipConfig, LovelaceChip } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";

@customElement(computeChipComponentName("conditional"))
export class ConditionalChip extends ConditionalBase implements LovelaceChip {
    public static async getConfigElement(): Promise<LovelaceChipEditor> {
        await import("./conditional-chip-editor");
        return document.createElement(
            computeChipEditorComponentName("conditional")
        ) as LovelaceChipEditor;
    }

    public static async getStubConfig(): Promise<ConditionalChipConfig> {
        return {
            type: `conditional`,
            conditions: [],
        };
    }

    public setConfig(config: ConditionalChipConfig): void {
        this.validateConfig(config);

        if (!config.chip) {
            throw new Error("No row configured");
        }

        this._element = createChipElement(config.chip) as LovelaceChip;
    }
}
