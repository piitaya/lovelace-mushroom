import { ActionConfig, HomeAssistant } from "custom-card-helpers";
import { Condition } from "../../conditional/validate-condition";
import { Info } from "../../info";

export interface LovelaceChip extends HTMLElement {
    hass?: HomeAssistant;
    editMode?: boolean;
    setConfig(config: LovelaceChipConfig);
}

export type ActionChipConfig = {
    type: "action";
    icon?: string;
    icon_color?: string;
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
};

export type BackChipConfig = {
    type: "back";
    icon?: string;
};

export type EntityChipConfig = {
    type: "entity";
    entity?: string;
    name?: string;
    content_info?: Info;
    icon?: string;
    icon_color?: string;
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
};

export type MenuChipConfig = {
    type: "menu";
    icon?: string;
};

export type WeatherChipConfig = {
    type: "weather";
    entity?: string;
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
    show_temperature?: boolean;
    show_conditions?: boolean;
};

export type TemplateChipConfig = {
    type: "template";
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
    content?: string;
    icon?: string;
    icon_color?: string;
    entity_id?: string | string[];
};

export interface ConditionalChipConfig {
    type: "conditional";
    chip?: LovelaceChipConfig;
    conditions: Condition[];
}

export type LovelaceChipConfig =
    | ActionChipConfig
    | BackChipConfig
    | EntityChipConfig
    | MenuChipConfig
    | WeatherChipConfig
    | TemplateChipConfig
    | ConditionalChipConfig;

export const CHIP_LIST: LovelaceChipConfig["type"][] = [
    "action",
    "back",
    "conditional",
    "entity",
    "menu",
    "template",
    "weather",
];
