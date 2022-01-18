import { HomeAssistant } from "custom-card-helpers";
import { PREFIX_NAME } from "../../../const";
import { GenericChipConfig } from "./generic-chip";
import { EntityChipConfig } from "./entity-chip";

export const createChipElement = (config: ChipConfig): LovelaceChip => {
    // @ts-ignore
    const element = document.createElement(
        `${PREFIX_NAME}-${config.type}-chip`,
        config
    ) as LovelaceChip;
    element.setConfig(config);
    return element;
};

export type ChipConfig = GenericChipConfig | EntityChipConfig;

export interface LovelaceChip extends HTMLElement {
    hass?: HomeAssistant;
    editMode?: boolean;
    setConfig(config: ChipConfig);
}

export { GenericChip } from "./generic-chip";
export { EntityChip } from "./entity-chip";
