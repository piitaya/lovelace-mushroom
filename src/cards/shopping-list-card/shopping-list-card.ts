import { UnsubscribeFunc } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { classMap } from "lit/directives/class-map.js";
import { computeRTL, LovelaceCard, LovelaceCardEditor } from "../../ha";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import "./shopping-list-card-item";
import "./shopping-list-card-divider";
import "./shopping-list-card-input";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import {
    SHOPPING_LIST_CARD_EDITOR_NAME,
    SHOPPING_LIST_CARD_NAME,
    SHOPPING_LIST_UPDATED_EVENT,
} from "./const";
import { ShoppingListCardConfig } from "./shopping-list-card-config";
import { addItem, clearItems, fetchItems, getStateDisplay, updateItem } from "./utils";
import { ShoppingListItem } from "../../ha/data/shopping-list";
import setupCustomlocalize from "../../localize";

registerCustomCard({
    type: SHOPPING_LIST_CARD_NAME,
    name: "Mushroom Shopping List Card",
    description: "Card for the shopping list integration",
});

@customElement(SHOPPING_LIST_CARD_NAME)
export class ShoppingListCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./shopping-list-card-editor");
        return document.createElement(SHOPPING_LIST_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static getStubConfig(): ShoppingListCardConfig {
        return {
            type: `custom:${SHOPPING_LIST_CARD_NAME}`,
            name: "Shopping List",
            icon: "mdi:cart",
            primary_info: "name",
            secondary_info: "state",
            checked_icon: "mdi:checkbox-marked",
            unchecked_icon: "mdi:checkbox-blank-outline",
        };
    }

    @state() private _config?: ShoppingListCardConfig;

    @state() private _items?: ShoppingListItem[];

    @state() private _newItemInputValue = "";

    getCardSize(): number {
        return (this._items?.length ?? 3) + 1;
    }

    public setConfig(config: ShoppingListCardConfig): void {
        this._config = config;
    }

    subscription: Promise<UnsubscribeFunc> | null = null;
    private subscribeToExternalEvents() {
        if (!this.hass) return;
        this.subscription = this.hass.connection.subscribeEvents(
            () => this._fetchData(),
            SHOPPING_LIST_UPDATED_EVENT
        );
    }

    public connectedCallback() {
        super.connectedCallback();
        this._fetchData();
        this.subscribeToExternalEvents();
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (changedProperties.has("hass") && !this.subscription) {
            this._fetchData();
            this.subscribeToExternalEvents();
        }
    }

    public disconnectedCallback() {
        super.disconnectedCallback();
        this.subscription?.then((unsub) => unsub());
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        const customLocalize = setupCustomlocalize(this.hass);

        const uncheckedItems = (this._items || []).filter((i) => !i.complete);
        const checkedItems = (this._items || []).filter((i) => i.complete);

        const name = this._config.name || "";
        const icon = this._config.icon;
        const rtl = computeRTL(this.hass);
        const { layout, ...computedAppearance } = computeAppearance(this._config);

        const appearance = {
            ...computedAppearance,
            // We handle a horizontal layout on our own.
            layout: layout === "horizontal" ? "default" : layout,
        };

        const completedCount = this._items?.filter((i) => i.complete)?.length;
        const displayState = customLocalize("editor.card.shopping_list.status")
            .replace("{completed_count}", `${completedCount || 0}`)
            .replace("{total_count}", `${this._items?.length || 0}`);
        const primaryState = getStateDisplay(this._config.primary_info, name, displayState);
        const secondaryState = getStateDisplay(this._config.secondary_info, name, displayState);

        return html`
            <ha-card class=${classMap({ "fill-container": appearance.fill_container })}>
                <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
                    <div class="layout-${layout === "horizontal" ? "inline" : "stack"}">
                        ${
                            primaryState || secondaryState
                                ? html`
                                      <mushroom-state-item ?rtl=${rtl} .appearance=${appearance}>
                                          ${icon
                                              ? html`<mushroom-shape-icon
                                                    slot="icon"
                                                    .icon=${icon}
                                                ></mushroom-shape-icon>`
                                              : html``}

                                          <mushroom-state-info
                                              slot="info"
                                              .primary=${primaryState}
                                              .secondary=${secondaryState}
                                          ></mushroom-state-info>
                                      </mushroom-state-item>
                                  `
                                : html``
                        }
                        <div class="actions" ?rtl=${rtl}>
                            <mushroom-shopping-list-input
                            class="new-item-input"
                                .placeholder=${customLocalize(
                                    "editor.card.shopping_list.add_item_placeholder"
                                )}
                                .value=${this._newItemInputValue}
                                @value-changed=${(e) => (this._newItemInputValue = e.detail.value)}
                                @keydown=${this._submitOnEnter}
                            /></mushroom-shopping-list-input>
                            <mushroom-button
                                icon="mdi:plus"
                                .disabled=${!this._newItemInputValue}
                                @click=${this._submitNewItem}
                            ></mushroom-button>
                        </div>
                    </div>

                    ${
                        this._items?.length
                            ? html`
                                  <div class="items">
                                      ${repeat(uncheckedItems, (item) => item.id, this._renderItem)}
                                      ${checkedItems.length > 0
                                          ? html`<mushroom-shopping-list-divider
                                                .localize=${customLocalize}
                                                @clear-completed=${this._clearItems}
                                            ></mushroom-shopping-list-divider>`
                                          : html``}
                                      ${repeat(checkedItems, (item) => item.id, this._renderItem)}
                                  </div>
                              `
                            : html``
                    }
                    ${this.renderIntegrationMissingMessage()}
                </mushroom-card>
            </ha-card>
        `;
    }

    private _renderItem = (item: ShoppingListItem) => {
        const { checked_icon, unchecked_icon } = ShoppingListCard.getStubConfig();
        return html`
            <mushroom-shopping-list-item
                class="item"
                .checked=${item.complete}
                .value=${item.name}
                .itemId=${item.id}
                .checkedIcon=${this._config?.checked_icon ?? checked_icon}
                .uncheckedIcon=${this._config?.unchecked_icon ?? unchecked_icon}
                @complete=${(e) => this._updateItem(item.id, { complete: e.detail.checked })}
                @name-change=${(e) => this._updateItem(item.id, { name: e.detail.value })}
            ></mushroom-shopping-list-item>
        `;
    };

    private renderIntegrationMissingMessage() {
        const customLocalize = setupCustomlocalize(this.hass);
        const integrationLoaded = this.hass?.config.components.includes("shopping_list");

        if (integrationLoaded) return html``;
        return html`<strong style="color: rgb(var(--rgb-warning))"
            >${customLocalize("editor.card.shopping_list.integration_missing")}</strong
        >`;
    }

    private _fetchData = async (): Promise<void> => {
        if (!this.hass) return;
        this._items = await fetchItems(this.hass);
    };

    private _updateItem(id: string, changes: Partial<ShoppingListItem>) {
        if (!this.hass) return;
        updateItem(this.hass, id, changes).catch(() => this._fetchData());
    }

    private _clearItems(): void {
        if (!this.hass) return;
        clearItems(this.hass).catch(() => this._fetchData());
    }

    private _addItem(value: string): void {
        if (!this.hass) return;
        addItem(this.hass, value).catch(() => this._fetchData());
    }

    private _submitNewItem(): void {
        if (!this._newItemInputValue) return;
        this._addItem(this._newItemInputValue);
        this._newItemInputValue = "";
    }

    private _submitOnEnter(ev): void {
        if (ev.key === "Enter") {
            this._submitNewItem();
        }
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                .layout-stack {
                    display: flex;
                    flex-direction: column;
                }

                .layout-stack > :not(:last-child) {
                    margin-bottom: var(--spacing);
                }

                .layout-inline {
                    display: grid;
                    grid-auto-flow: column;
                    grid-auto-columns: minmax(0px, 1fr);
                    gap: var(--spacing);
                }

                .new-item-input {
                    flex: 1;
                }
            `,
        ];
    }
}
