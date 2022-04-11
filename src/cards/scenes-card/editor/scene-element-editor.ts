import { customElement } from "lit/decorators.js";
import { MushroomElementEditor } from "../../../utils/lovelace/element-editor";
import { SceneCardConfig } from "../scene-editor-config";
import { computeComponentName, LovelaceSceneEditor } from "../utils";

@customElement("mushroom-scene-element-editor")
export class MushroomSceneElementEditor extends MushroomElementEditor<SceneCardConfig> {
    protected get configElementType(): string | undefined {
        return this.value?.type;
    }

    protected async getConfigElement(): Promise<LovelaceSceneEditor | undefined> {
        const elClass = (await getElementClass(this.configElementType!)) as any;

        // Check if a GUI editor exists
        if (elClass && elClass.getConfigElement) {
            return elClass.getConfigElement();
        }

        return undefined;
    }
}

export const getElementClass = (type: string) =>
    customElements.get(computeComponentName(type));
