import { PREFIX_NAME } from "../../../const";
import { LovelaceChip, LovelaceChipConfig } from "./types";

export const createChipElement = (config: LovelaceChipConfig): LovelaceChip | undefined => {
    try {
        // @ts-ignore
        const element = document.createElement(
            computeChipComponentName(config.type),
            config
        ) as LovelaceChip;
        element.setConfig(config);
        return element;
    } catch (err) {
        return undefined;
    }
};

export function computeChipComponentName(type: string): string {
    return `${PREFIX_NAME}-${type}-chip`;
}

export function computeChipEditorComponentName(type: string): string {
    return `${PREFIX_NAME}-${type}-chip-editor`;
}
