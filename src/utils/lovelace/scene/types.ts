import { ActionConfig, HomeAssistant } from "custom-card-helpers";

export interface LovelaceScene extends HTMLElement {
    hass?: HomeAssistant;
    editMode?: boolean;
    setConfig(config: LovelaceSceneConfig);
}

export type LovelaceSceneConfig = {
    type: "scene",
    entity?: string;
    name?: string;
    icon?: string;
    icon_color?: string; 
    background_color?: string;    
    hold_action?: ActionConfig;
    tap_action?: ActionConfig;
    double_tap_action?: ActionConfig;
};