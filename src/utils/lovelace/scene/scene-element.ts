import { PREFIX_NAME } from "../../../const";
import { LovelaceScene, LovelaceSceneConfig } from "./types";

export const createSceneElement = (config: LovelaceSceneConfig): LovelaceScene | undefined => {
    try {
        // @ts-ignore
        const element = document.createElement(
            computeSceneComponentName(config.type),
            config
        ) as LovelaceScene;
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
