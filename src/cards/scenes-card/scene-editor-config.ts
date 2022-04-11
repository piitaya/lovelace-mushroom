import { HomeAssistant } from "custom-card-helpers";

export interface SceneElement extends HTMLElement {
    hass?: HomeAssistant;
    editMode?: boolean;
    setConfig(config: ItemConfig);
}

export type SceneConfig = {
    type: "scene";
    entity?: string;
    name?: string;
    icon?: string;
    icon_color?: string;
    background_color?: string;
};

export type ScriptConfig = {
    type: "script";
    entity?: string;
    name?: string;
    icon?: string;
    icon_color?: string;
    background_color?: string;
};

export type ItemConfig = SceneConfig | ScriptConfig;

export const ITEM_LIST: ItemConfig["type"][] = ["scene", "script"];
