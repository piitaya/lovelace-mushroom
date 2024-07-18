import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { DEFAULT_CHECKED_ICON, DEFAULT_UNCHECKED_ICON, TODO_LIST_CARD_ITEM_NAME } from "./const";

@customElement(TODO_LIST_CARD_ITEM_NAME)
export class TodoListItem extends LitElement {
    @property() checked: boolean = false;
    @property() value: string = "";
    @property() highlighted: boolean = false;
    @property() checkedIcon = DEFAULT_CHECKED_ICON;
    @property() uncheckedIcon = DEFAULT_UNCHECKED_ICON;

    protected render(): TemplateResult {
        return html`
            <div class="input-wrapper ${classMap({ "greyed-out": this.checked })}">
                <div class="checkbox-wrapper">
                    <ha-icon
                        class="checkbox-icon"
                        .icon=${this.checked ? this.checkedIcon : this.uncheckedIcon}
                    ></ha-icon>
                    <input
                        class="checkbox"
                        type="checkbox"
                        .checked=${this.checked}
                        @click=${this._onCheckboxChange}
                    />
                </div>
                <input .value=${this.value} class="input" @input=${this._onTextInput} />
            </div>
        `;
    }

    private _onTextInput(e: Event) {
        const event = new CustomEvent("name-change", {
            bubbles: true,
            composed: true,
            detail: { value: (e.target as HTMLInputElement).value },
        });
        this.dispatchEvent(event);
    }

    private _onCheckboxChange(e: Event) {
        const event = new CustomEvent("complete", {
            bubbles: true,
            composed: true,
            detail: { checked: (e.target as HTMLInputElement).checked },
        });
        this.dispatchEvent(event);
    }

    static get styles(): CSSResultGroup {
        return [
            css`
                .input-wrapper * {
                    box-sizing: border-box;
                    outline: none !important;
                }

                .input-wrapper {
                    display: flex;
                    align-items: center;
                    border-radius: var(--control-border-radius);
                }

                .input-wrapper.greyed-out .input {
                    color: var(--secondary-text-color); // #9b9b9b;
                    text-decoration: line-through;
                }

                .checkbox-wrapper {
                    position: relative;
                    flex-shrink: 0;
                    height: 42px;
                    width: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .checkbox {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    appearance: none;
                    cursor: pointer;
                    margin: 0;
                }

                .checkbox-icon {
                    width: 24px;
                    height: 24px;
                    pointer-events: none;
                }

                .input {
                    flex: 1;
                    height: 42px;
                    min-width: 0;
                    background: transparent;
                    border: none;
                    font-weight: 600;
                    color: var(--primary-text-color);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-right: var(--spacing);
                }
            `,
        ];
    }
}
