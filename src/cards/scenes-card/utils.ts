import { PREFIX_NAME } from "../../const";
import { LovelaceGenericElementEditor } from "../../utils/lovelace/types";
import { SceneElement, ItemConfig } from "./scene-editor-config";

export const createSceneElement = (config: ItemConfig): SceneElement | undefined => {
    try {
        // @ts-ignore
        const element = document.createElement(
            computeComponentName(config.type),
            config
        ) as SceneElement;
        element.setConfig(config);
        return element;
    } catch (err) {
        return undefined;
    }
};

export function computeComponentName(type: string): string {
    return `${PREFIX_NAME}-${type}-scene`;
}

export function computeEditorComponentName(type: string): string {
    return `${PREFIX_NAME}-${type}-scene-editor`;
}
