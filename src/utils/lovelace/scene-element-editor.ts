import { customElement } from "lit/decorators.js";
import { LovelaceSceneEditor } from "../../cards/scenes-card/editors/scene-element-editor";
import { MushroomElementEditor } from "./element-editor";
import { computeSceneComponentName } from "./scene/scene-element";
import { LovelaceSceneConfig } from "./scene/types";

@customElement("mushroom-scene-element-editor")
export class MushroomSceneElementEditor extends MushroomElementEditor<LovelaceSceneConfig> {
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
