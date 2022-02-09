import { HomeAssistant } from "custom-card-helpers";
import { LovelaceChipConfig } from "../../../utils/lovelace/chip/types";
import { computeChipComponentName } from "../utils";

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

export interface LovelaceChip extends HTMLElement {
    hass?: HomeAssistant;
    editMode?: boolean;
    setConfig(config: LovelaceChipConfig);
}

export { EntityChip } from "./entity-chip";
export { WeatherChip } from "./weather-chip";
export { BackChip } from "./back-chip";
export { ActionChip } from "./action-chip";
export { MenuChip } from "./menu-chip";
export { TemplateChip } from "./template-chip";
