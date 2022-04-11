import { HomeAssistant } from "custom-card-helpers";
import { LovelaceGenericElementEditor } from "../../utils/lovelace/types";


export interface LovelaceItemEditor extends LovelaceGenericElementEditor {
    setConfig(config: ItemConfig): void;
}

export interface SubItemEditorConfig {
    index?: number;
    elementConfig?: ItemConfig;
    type: string;
}

export interface EditSubItemEditorConfig {
    subElementConfig: SubItemEditorConfig;
}

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
