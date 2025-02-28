import { PREFIX_NAME } from "../../../const";
import { LovelaceChip, LovelaceChipConfig } from "./types";

export const createChipElement = (
  config: LovelaceChipConfig
): LovelaceChip | undefined => {
  try {
    const tag = computeChipComponentName(config.type);
    if (customElements.get(tag)) {
      // @ts-ignore
      const element = document.createElement(tag, config) as LovelaceChip;
      element.setConfig(config);
      return element;
    }
    // @ts-ignore
    const element = document.createElement(tag) as LovelaceChip;
    customElements.whenDefined(tag).then(() => {
      try {
        customElements.upgrade(element);
        element.setConfig(config);
      } catch (err: any) {
        // Do nothing
      }
    });
    return element;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export function computeChipComponentName(type: string): string {
  return `${PREFIX_NAME}-${type}-chip`;
}

export function computeChipEditorComponentName(type: string): string {
  return `${PREFIX_NAME}-${type}-chip-editor`;
}
