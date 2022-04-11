import { customElement } from "lit/decorators.js";
import { MushroomElementEditor } from "../../../utils/lovelace/element-editor";
import { SceneCardConfig } from "../scene-editor-config";
import { computeSceneComponentName, LovelaceSceneEditor } from "../utils";

@customElement("mushroom-scene-element-editor")
export class MushroomSceneElementEditor extends MushroomElementEditor<SceneCardConfig> {
    protected get configElementType(): string | undefined {
        return this.value?.type;
    }

    protected async getConfigElement(): Promise<LovelaceSceneEditor | undefined> {
        const elClass = (await getSceneElementClass(this.configElementType!)) as any;

        // Check if a GUI editor exists
        if (elClass && elClass.getConfigElement) {
            return elClass.getConfigElement();
        }

        return undefined;
    }
}

export const getSceneElementClass = (type: string) =>
    customElements.get(computeSceneComponentName(type));
