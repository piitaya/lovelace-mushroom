import { HomeAssistant } from "custom-card-helpers";
import { computeChipComponentName } from "../utils";
import { EntityChipConfig } from "./entity-chip";
import { WeatherChipConfig } from "./weather-chip";

export const createChipElement = (
    config: ChipConfig
): LovelaceChip | undefined => {
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
    setConfig(config: ChipConfig);
}

export type ChipConfig = EntityChipConfig | WeatherChipConfig;

export { EntityChip } from "./entity-chip";
export { WeatherChip } from "./weather-chip";
