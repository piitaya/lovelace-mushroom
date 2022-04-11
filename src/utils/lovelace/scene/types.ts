import { ActionConfig, HomeAssistant } from "custom-card-helpers";

export interface LovelaceScene extends HTMLElement {
    hass?: HomeAssistant;
    editMode?: boolean;
    setConfig(config: LovelaceSceneConfig);
}

export type SceneSceneConfig = {
    type: "scene";
    entity?: string;
    name?: string;
    icon?: string;
    icon_color?: string;
    background_color?: string;
};

export type ScriptSceneConfig = {
    type: "script";
    entity?: string;
    name?: string;
    icon?: string;
    icon_color?: string;
    background_color?: string;
};

export type LovelaceSceneConfig = SceneSceneConfig | ScriptSceneConfig;

export const ITEM_LIST: LovelaceSceneConfig["type"][] = ["scene", "script"];
