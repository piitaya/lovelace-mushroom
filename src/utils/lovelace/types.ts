import { HomeAssistant, LovelaceConfig } from "custom-card-helpers";
import { LovelaceChipConfig } from "./chip/types";

export interface LovelaceChipEditor extends LovelaceGenericElementEditor {
    setConfig(config: LovelaceChipConfig): void;
}

export interface LovelaceGenericElementEditor extends HTMLElement {
    hass?: HomeAssistant;
    lovelace?: LovelaceConfig;
    setConfig(config: any): void;
    focusYamlEditor?: () => void;
}
