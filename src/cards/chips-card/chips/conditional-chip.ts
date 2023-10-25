import { atLeastHaVersion } from "../../../ha";
import { loadConditionalCardComponents, loadCustomElement } from "../../../utils/loader";
import {
    computeChipComponentName,
    computeChipEditorComponentName,
    createChipElement,
} from "../../../utils/lovelace/chip/chip-element";
import { ConditionalChipConfig, LovelaceChip } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import "./conditional-chip-editor";
import "./conditional-chip-editor-legacy";

async function setupConditionChipComponent() {
    const HuiConditionalBase = await loadCustomElement("hui-conditional-base");
    // @ts-ignore
    class ConditionalChip extends HuiConditionalBase implements LovelaceChip {
        public static async getConfigElement(): Promise<LovelaceChipEditor> {
            const version = (document.querySelector("home-assistant")! as any).hass.connection
                .haVersion;
            const legacy = !atLeastHaVersion(version, 2023, 11);
            const suffix = legacy ? "-legacy" : "";
            const tag = `${computeChipEditorComponentName("conditional")}${suffix}`;
            return document.createElement(tag) as LovelaceChipEditor;
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
    // @ts-ignore
    customElements.define(computeChipComponentName("conditional"), ConditionalChip);
}

loadConditionalCardComponents();
setupConditionChipComponent();
