import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { TODO_LIST_CARD_DIVIDER_NAME } from "./const";

@customElement(TODO_LIST_CARD_DIVIDER_NAME)
export class TodoListCardDivider extends LitElement {
    @property() localize: (key: string) => string = (key) => key;

    private _buttonClicked() {
        const event = new CustomEvent("clear-completed", { bubbles: true, composed: true });
        this.dispatchEvent(event);
    }

    protected render(): TemplateResult {
        return html`
            <div class="divider">
                <hr class="hr-start" />
                <button class="button" @click=${this._buttonClicked}>
                    <ha-icon class="button-icon" icon="mdi:delete-sweep-outline"></ha-icon>
                    ${this.localize("editor.card.todo_list.clear_completed")}
                </button>
                <hr class="hr-end" />
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            css`
                .divider * {
                    box-sizing: border-box;
                }

                .divider {
                    display: flex;
                    align-items: center;
                    margin: 0 calc(var(--spacing) * -1);
                }

                .hr-start,
                .hr-end {
                    height: 1px;
                    background: rgba(var(--rgb-primary-text-color), 0.05);
                    flex-shrink: 0;
                    border: none;
                    min-width: calc(var(--spacing) * 1);
                }

                .hr-start {
                    flex: 1;
                }

                .button {
                    flex-shrink: 0;
                    box-sizing: border-box;
                    background: transparent;
                    border: none;
                    font-weight: 600;
                    color: var(--secondary-text-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 var(--spacing);
                    cursor: pointer;
                }

                .button-icon {
                    --mdc-icon-size: 20px;
                    margin-inline-end: 0.5rem;
                }
            `,
        ];
    }
}
