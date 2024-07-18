import { loadCustomElement } from "../../../utils/loader";
import {
  computeChipComponentName,
  computeChipEditorComponentName,
  createChipElement,
} from "../../../utils/lovelace/chip/chip-element";
import {
  ConditionalChipConfig,
  LovelaceChip,
} from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";

const componentName = computeChipComponentName("conditional");

export const setupConditionChipComponent = async () => {
  // Don't resetup the component if already set up.
  if (customElements.get(componentName)) {
    return;
  }

  // Load conditional base
  if (!customElements.get("hui-conditional-base")) {
    const helpers = await (window as any).loadCardHelpers();
    helpers.createCardElement({
      type: "conditional",
      card: { type: "button" },
      conditions: [],
    });
  }
  const HuiConditionalBase = await loadCustomElement("hui-conditional-base");

  // @ts-ignore
  class ConditionalChip extends HuiConditionalBase implements LovelaceChip {
    public static async getConfigElement(): Promise<LovelaceChipEditor> {
      await import("./conditional-chip-editor");
      return document.createElement(
        computeChipEditorComponentName("conditional")
      ) as LovelaceChipEditor;
    }

    public static async getStubConfig(): Promise<ConditionalChipConfig> {
      return {
        type: `conditional`,
        conditions: [],
      };
    }

    public setConfig(config: ConditionalChipConfig): void {
      this.validateConfig(config);

      if (!config.chip) {
        throw new Error("No chip configured");
      }

      this._element = createChipElement(config.chip) as LovelaceChip;
    }
  }

  if (!customElements.get(componentName)) {
    // @ts-ignore
    customElements.define(componentName, ConditionalChip);
  }
};
