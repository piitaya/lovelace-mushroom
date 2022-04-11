import { PREFIX_NAME } from "../../const";
import { LovelaceGenericElementEditor } from "../../utils/lovelace/types";
import { SceneElement, SceneCardConfig } from "./scene-editor-config";

export interface LovelaceSceneEditor extends LovelaceGenericElementEditor {
    setConfig(config: SceneCardConfig): void;
}

export const createSceneElement = (config: SceneCardConfig): SceneElement | undefined => {
    try {
        // @ts-ignore
        const element = document.createElement(
            computeSceneComponentName(config.type),
            config
        ) as SceneElement;
        element.setConfig(config);
        return element;
    } catch (err) {
        return undefined;
    }
};

export function computeSceneComponentName(type: string): string {
    return `${PREFIX_NAME}-${type}-scene`;
}

export function computeSceneEditorComponentName(type: string): string {
    return `${PREFIX_NAME}-${type}-scene-editor`;
}
