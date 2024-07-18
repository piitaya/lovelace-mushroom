import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fireEvent } from "../../ha";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { TODO_LIST_CARD_INPUT_NAME } from "./const";

@customElement(TODO_LIST_CARD_INPUT_NAME)
export class TodoListItemInput extends LitElement {
    @property() value: string = "";
    @property() placeholder: string = "";

    private _handleInput(e) {
        fireEvent(this, "value-changed", { value: e.target.value });
    }

    protected render(): TemplateResult {
        return html`
            <input
                type="text"
                class="input"
                @input=${this._handleInput}
                .placeholder=${this.placeholder}
                .value=${this.value}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            css`
                .input {
                    height: 42px;
                    display: block;
                    background: rgba(var(--rgb-primary-text-color), 0.05);
                    transition: background-color 280ms ease-in-out 0s;
                    border-radius: var(--control-border-radius);
                    border: none;
                    box-sizing: border-box;
                    padding: 0 1rem;
                    font-weight: 600;
                    color: var(--primary-text-color);
                    outline: none !important;
                    min-width: 0;
                    width: 100%;
                }

                .input:placeholder {
                    font-weight: 600;
                    color: var(--secondary-text-color);
                }
            `,
        ];
    }
}
