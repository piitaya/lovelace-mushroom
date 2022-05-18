import {
    createThing,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, PropertyValueMap, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { MushroomBaseElement } from "../../utils/base-element";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { STACK_CARD_EDITOR_NAME, STACK_CARD_NAME } from "./const";
import { StackCardConfig } from "./stack-card-config";

registerCustomCard({
    type: STACK_CARD_NAME,
    name: "Mushroom Stack Card",
    description: "Stack card for sub elements",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HELPERS = (window as any).loadCardHelpers ? (window as any).loadCardHelpers() : undefined;

@customElement(STACK_CARD_NAME)
export class StackCard extends MushroomBaseElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./stack-card-editor");
        return document.createElement(STACK_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<StackCardConfig> {
        return { cards: [], layout: "default", type: `custom:${STACK_CARD_NAME}` };
    }

    @state() private _config?: StackCardConfig;

    @property() protected _card?: LovelaceCard;

    private _computeCardSize(card: LovelaceCard): number | Promise<number> {
        if (typeof card.getCardSize === "function") {
            return card.getCardSize();
        }
        if (customElements.get(card.localName)) {
            return 1;
        }
        return customElements.whenDefined(card.localName).then(() => this._computeCardSize(card));
    }

    async getCardSize(): Promise<number> {
        if (!this._card) {
            return 0;
        }
        return await this._computeCardSize(this._card);
    }

    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.updated(_changedProperties);
        if (!this._card) return;
        this._waitForUpdate(this._card);
        window.setTimeout(() => {
            this._waitForUpdate(this._card);
        }, 500);
    }

    async setConfig(config: StackCardConfig): Promise<void> {
        this._config = {
            layout: "default",
            ...config,
        };

        await this._createStack();
    }

    private async _createStack() {
        let _mode = "vertical";
        if (this._config!.layout == "horizontal") _mode = "horizontal";
        this._card = await this._createCardElement({
            type: `${_mode}-stack`,
            cards: this._config!.cards,
        });
    }

    private async _createCardElement(cardConfig: LovelaceCardConfig) {
        let element: LovelaceCard;
        if (HELPERS) {
            element = (await HELPERS).createCardElement(cardConfig);
        } else {
            element = createThing(cardConfig);
        }
        if (this.hass) {
            element.hass = this.hass;
        }
        if (element) {
            element.addEventListener(
                "ll-rebuild",
                (ev) => {
                    ev.stopPropagation();
                    this._rebuildCard(element, cardConfig);
                },
                { once: true }
            );
        }
        return element;
    }

    private async _rebuildCard(
        element: LovelaceCard,
        config: LovelaceCardConfig
    ): Promise<LovelaceCard> {
        const newCard = await this._createCardElement(config);
        element.replaceWith(newCard);
        this._card = newCard;
        window.setTimeout(() => {
            this._waitForUpdate(this._card);
        }, 500);
        return newCard;
    }

    private _waitForUpdate(card: LovelaceCard | undefined): void {
        if ((card as unknown as LitElement).updateComplete) {
            (card as unknown as LitElement).updateComplete.then(() => this._cleanCardStyle(card));
        } else {
            this._cleanCardStyle(card);
        }
        this._cleanCardStyle(card);
    }

    private _cleanCardStyle(element: LovelaceCard | undefined) {
        if (!element) return;
        const config = this._config;
        if (element.shadowRoot) {
            if (element.shadowRoot.querySelector("ha-card")) {
                const ele = element.shadowRoot.querySelector("ha-card") as HTMLElement;
                ele.style.boxShadow = "none";
                ele.style.borderRadius = "0";
                if (config?.styles) {
                    Object.entries(config.styles).forEach(([key, value]) =>
                        ele.style.setProperty(key, value)
                    );
                }
            } else {
                let searchEles = element.shadowRoot.getElementById("root") as any;
                if (!searchEles) {
                    searchEles = element.shadowRoot.getElementById("card") as any;
                }
                if (!searchEles) return;
                searchEles = searchEles.childNodes as NodeListOf<any>;
                for (let i = 0; i < searchEles.length; i++) {
                    if (searchEles[i].style) {
                        searchEles[i].style.margin = "0px";
                    }
                    this._cleanCardStyle(searchEles[i]);
                }
            }
        } else {
            if (typeof element.querySelector === "function" && element.querySelector("ha-card")) {
                const ele = element.querySelector("ha-card") as any;
                ele.style.boxShadow = "none";
                ele.style.borderRadius = "0";
                if (config?.styles) {
                    Object.entries(config.styles).forEach(([key, value]) =>
                        ele.style.setProperty(key, value)
                    );
                }
            }
            const searchEles = element.childNodes as NodeListOf<any>;
            for (let i = 0; i < searchEles.length; i++) {
                if (searchEles[i] && searchEles[i].style) {
                    searchEles[i].style.margin = "0px";
                }
                this._cleanCardStyle(searchEles[i]);
            }
        }
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._card) {
            return html``;
        }

        return html`<ha-card header=${this._config.title ?? null}>
            <div>${this._card}</div>
        </ha-card>`;
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                ha-card {
                    overflow: hidden;
                }
            `,
        ];
    }
}
