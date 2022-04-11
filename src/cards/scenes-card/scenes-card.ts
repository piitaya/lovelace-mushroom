import {
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { registerCustomCard } from "../../utils/custom-cards";
import { SCENES_CARD_EDITOR_NAME, SCENES_CARD_NAME } from "./const";
import { cardStyle } from "../../utils/card-styles";
import { SceneItem } from "./items/scene-item";
import { SceneElement, ItemConfig } from "./scene-editor-config";
import { createSceneElement } from "./utils";
import { ScriptItem } from "./items/script-item";

export interface ScenesCardConfig extends LovelaceCardConfig {
    items: ItemConfig[];
}

registerCustomCard({
    type: SCENES_CARD_NAME,
    name: "Mushroom Scenes Card",
    description: "Card with scenes or scripts",
});

@customElement(SCENES_CARD_NAME)
export class ScenesCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./scenes-card-editor");
        return document.createElement(SCENES_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(_hass: HomeAssistant): Promise<ScenesCardConfig> {
        const items = await Promise.all([
            SceneItem.getStubConfig(_hass),
            ScriptItem.getStubConfig(_hass),
        ]);
        return {
            type: `custom:${SCENES_CARD_NAME}`,
            items,
        };
    }

    @state() private _config?: ScenesCardConfig;

    private _hass?: HomeAssistant;

    set hass(hass: HomeAssistant) {
        this._hass = hass;
        this.shadowRoot?.querySelectorAll("div > *").forEach((element: unknown) => {
            (element as SceneElement).hass = hass;
        });
    }

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: ScenesCardConfig): void {
        this._config = config;
    }

    protected render(): TemplateResult {
        if (!this._config || !this._hass) {
            return html``;
        }

        return html`
            <mushroom-card>
                <div class="item-container">
                    ${this._config.items.map((item) => this.renderItem(item))}
                </div>
            </mushroom-card>
        `;
    }

    private renderItem(sceneConfig: ItemConfig): TemplateResult {
        const element = createSceneElement(sceneConfig);
        if (!element) {
            return html``;
        }
        if (this._hass) {
            element.hass = this._hass;
        }
        return html`${element}`;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                .item-container {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                    justify-content: flex-start;
                    flex-wrap: wrap;
                    margin-bottom: calc(-1 * var(--scene-spacing));
                    justify-content: space-between;
                    padding: 12px;
                }
                .item-container * {
                    margin-bottom: var(--item-spacing);
                }
                .item-container *:not(:last-child) {
                    margin-right: var(--item-spacing);
                }
            `,
        ];
    }
}
