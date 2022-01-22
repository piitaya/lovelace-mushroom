import { HomeAssistant } from "custom-card-helpers";
import { computeChipComponentName } from "../utils";
import { ActionChipConfig } from "./action-chip";
import { BackChipConfig } from "./back-chip";
import { EntityChipConfig } from "./entity-chip";
import { MenuChipConfig } from "./menu-chip";
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

export type ChipConfig =
    | EntityChipConfig
    | WeatherChipConfig
    | BackChipConfig
    | ActionChipConfig
    | MenuChipConfig;

export { EntityChip } from "./entity-chip";
export { WeatherChip } from "./weather-chip";
export { BackChip } from "./back-chip";
export { ActionChip } from "./action-chip";
export { MenuChip } from "./menu-chip";
