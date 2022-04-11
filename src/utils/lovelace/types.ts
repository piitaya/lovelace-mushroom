import { HomeAssistant, LovelaceCardConfig, LovelaceConfig } from "custom-card-helpers";
import { Condition } from "../conditional/validate-condition";
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

export interface ConditionalCardConfig extends LovelaceCardConfig {
    card: LovelaceCardConfig;
    conditions: Condition[];
}
