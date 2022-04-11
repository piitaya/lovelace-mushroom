import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { registerCustomCard } from "../../utils/custom-cards";
import { SCENES_CARD_EDITOR_NAME, SCENES_CARD_NAME } from "./const";
import { ScenesCardConfig } from "../../utils/lovelace/scene/types";

registerCustomCard({
    type: SCENES_CARD_NAME,
    name: "Mushroom Scenes Card",
    description: "Card for scenes",
});

@customElement(SCENES_CARD_NAME)
export class ScenesCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./scenes-card-scene-editor");
        return document.createElement(SCENES_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(_hass: HomeAssistant): Promise<ScenesCardConfig> {
        const scenes = await Promise.all([EntityScene.getStubConfig(_hass)]);
        return {
            type: `custom:${SCENES_CARD_NAME}`,
            chips: scenes,
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: ScenesCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: ScenesCardConfig): void {
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        return html` <mushroom-card> </mushroom-card> `;
    }
}
