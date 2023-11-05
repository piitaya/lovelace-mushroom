import { UnsubscribeFunc } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { classMap } from "lit/directives/class-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    isActive,
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import "./todo-list-card-item";
import "./todo-list-card-divider";
import "./todo-list-card-input";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import {
    DEFAULT_CHECKED_ICON,
    DEFAULT_UNCHECKED_ICON,
    TODO_LIST_CARD_EDITOR_NAME,
    TODO_LIST_CARD_NAME,
    TODO_LIST_ENTITY_DOMAINS,
    TODO_LIST_UPDATED_EVENT,
} from "./const";
import { TodoListCardConfig } from "./todo-list-card-config";
import { createItem, deleteItems, fetchItems, getStateDisplay, updateItem } from "./utils";
import setupCustomlocalize from "../../localize";
import { TodoItem, TodoItemStatus } from "../../ha/data/todo-list";

registerCustomCard({
    type: TODO_LIST_CARD_NAME,
    name: "Mushroom Todo List Card",
    description: "Card for todo list entity",
});

@customElement(TODO_LIST_CARD_NAME)
export class TodoListCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./todo-list-card-editor");
        return document.createElement(TODO_LIST_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static getStubConfig(hass: HomeAssistant): TodoListCardConfig {
        const entities = Object.keys(hass.states);
        const lists = entities.filter((e) => TODO_LIST_ENTITY_DOMAINS.includes(e.split(".")[0]));

        return {
            type: `custom:${TODO_LIST_CARD_NAME}`,
            entity: lists[0],
            name: "Todo List",
            icon: "mdi:format-list-checks",
            primary_info: "name",
            secondary_info: "state",
            checked_icon: DEFAULT_CHECKED_ICON,
            unchecked_icon: DEFAULT_UNCHECKED_ICON,
        };
    }

    @state() private _config?: TodoListCardConfig;

    @state() private _items?: TodoItem[];

    @state() private _newItemInputValue = "";

    getCardSize(): number {
        return (this._items?.length ?? 3) + 1;
    }

    public setConfig(config: TodoListCardConfig): void {
        this._config = {
            tap_action: {
                action: "none",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    private isLegacyShoppingListEntity() {
        if (!this._config?.entity) return false;
        return this.hass?.entities[this._config.entity]?.platform === "shopping_list";
    }

    subscription: Promise<UnsubscribeFunc> | null = null;
    private subscribeToLegacyShoppingListEvents() {
        if (!this.hass) return;
        this.subscription = this.hass.connection.subscribeEvents(
            () => this._fetchData(),
            TODO_LIST_UPDATED_EVENT
        );
    }

    public connectedCallback() {
        super.connectedCallback();
        this._fetchData();

        if (this.isLegacyShoppingListEntity()) {
            this.subscribeToLegacyShoppingListEvents();
        }
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);

        if (changedProperties.has("hass") && !this.subscription) {
            this._fetchData();

            if (this.isLegacyShoppingListEntity()) {
                this.subscribeToLegacyShoppingListEvents();
            }
        }

        if (!this.isLegacyShoppingListEntity()) {
            const entityId = this._config?.entity;
            const oldHass = changedProperties.get("hass") as HomeAssistant | undefined;

            if (entityId && oldHass && oldHass.states[entityId] !== this.hass.states[entityId]) {
                this._fetchData();
            }
        }
    }

    public disconnectedCallback() {
        super.disconnectedCallback();
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        const entityId = this._config.entity;
        const stateObj = entityId ? this.hass.states[entityId] : null;

        if (!stateObj) {
            return this.renderNotFound(this._config);
        }

        const customLocalize = setupCustomlocalize(this.hass);

        const uncheckedItems = (this._items || []).filter(
            (i) => i.status === TodoItemStatus.NeedsAction
        );
        const checkedItems = (this._items || []).filter(
            (i) => i.status === TodoItemStatus.Completed
        );

        const name = this._config.name || "";
        const icon = this._config.icon;
        const rtl = computeRTL(this.hass);
        const { layout, ...computedAppearance } = computeAppearance(this._config);

        const appearance = {
            ...computedAppearance,
            // We handle a horizontal layout on our own.
            layout: layout === "horizontal" ? "default" : layout,
        };

        const completedCount = checkedItems?.length;
        const displayState = customLocalize("editor.card.todo_list.status")
            .replace("{completed_count}", `${completedCount || 0}`)
            .replace("{total_count}", `${this._items?.length || 0}`);
        const primaryState = getStateDisplay(this._config.primary_info, name, displayState);
        const secondaryState = getStateDisplay(this._config.secondary_info, name, displayState);

        const active = isActive(stateObj);
        return html`
            <ha-card class=${classMap({ "fill-container": appearance.fill_container })}>
                <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
                    <div class="layout-${layout === "horizontal" ? "inline" : "stack"}">
                        ${
                            primaryState || secondaryState
                                ? html`
                                      <mushroom-state-item
                                          ?rtl=${rtl}
                                          .appearance=${appearance}
                                          @action=${this._handleAction}
                                          .actionHandler=${actionHandler({
                                              hasHold: hasAction(this._config.hold_action),
                                              hasDoubleClick: hasAction(
                                                  this._config.double_tap_action
                                              ),
                                          })}
                                      >
                                          ${icon
                                              ? html`<mushroom-shape-icon
                                                    slot="icon"
                                                    .disabled=${!active}
                                                >
                                                    <ha-state-icon .icon=${icon}></ha-state-icon>
                                                </mushroom-shape-icon>`
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
                            <mushroom-todo-list-input
                            class="new-item-input"
                                .placeholder=${customLocalize(
                                    "editor.card.todo_list.add_item_placeholder"
                                )}
                                .value=${this._newItemInputValue}
                                @value-changed=${(e) => (this._newItemInputValue = e.detail.value)}
                                @keydown=${this._submitOnEnter}
                            /></mushroom-todo-list-input>
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
                                      ${repeat(
                                          uncheckedItems,
                                          (item) => item.uid,
                                          this._renderItem
                                      )}
                                      ${checkedItems.length > 0
                                          ? html`<mushroom-todo-list-divider
                                                .localize=${customLocalize}
                                                @clear-completed=${this._clearItems}
                                            ></mushroom-todo-list-divider>`
                                          : html``}
                                      ${repeat(checkedItems, (item) => item.uid, this._renderItem)}
                                  </div>
                              `
                            : html``
                    }
                </mushroom-card>
            </ha-card>
        `;
    }

    private _renderItem = (item: TodoItem) => {
        return html`
            <mushroom-todo-list-item
                class="item"
                .checked=${item.status === TodoItemStatus.Completed}
                .value=${item.summary}
                .itemId=${item.uid}
                .checkedIcon=${this._config?.checked_icon ?? DEFAULT_CHECKED_ICON}
                .uncheckedIcon=${this._config?.unchecked_icon ?? DEFAULT_UNCHECKED_ICON}
                @complete=${(e) =>
                    this._updateItem(item.uid, {
                        status: e.detail.checked
                            ? TodoItemStatus.Completed
                            : TodoItemStatus.NeedsAction,
                    })}
                @name-change=${(e) => this._updateItem(item.uid, { summary: e.detail.value })}
            ></mushroom-todo-list-item>
        `;
    };

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    private _getItem(itemId: string) {
        return this._items?.find((item) => item.uid === itemId);
    }

    private _fetchData = async (): Promise<void> => {
        if (!this.hass || !this._config?.entity) return;
        this._items = await fetchItems(this.hass, this._config.entity);
    };

    private _updateItem(id: string, changes: Partial<TodoItem>) {
        const item = this._getItem(id);
        if (!item || !this.hass || !this._config?.entity) return;
        updateItem(this.hass, this._config.entity, { ...item, ...changes }).catch(() =>
            this._fetchData()
        );
    }

    private async _clearItems(): Promise<void> {
        if (!this.hass || !this._config?.entity) return;
        const completedUids = this._items
            ?.filter((i) => i.status === TodoItemStatus.Completed)
            .map((item) => item.uid);

        if (!completedUids?.length) return;

        try {
            await deleteItems(this.hass, this._config.entity, completedUids);
        } finally {
            // Have to use finally here because no change event is emitted by backend.
            this._fetchData();
        }
    }

    private _addItem(value: string): void {
        if (!this.hass || !this._config?.entity) return;
        createItem(this.hass, this._config.entity, value).catch(() => this._fetchData());
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
