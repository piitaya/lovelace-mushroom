import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { formatNumber } from "../../../../ha";

@customElement("mushroom-temperature-button")
export class TemperatureSingleButton extends LitElement {
    @property({ type: Boolean }) public disabled: boolean = false;

    @property({ type: Boolean }) public pending: boolean = false;

    @property() public value?: string;

    protected render(): TemplateResult {
        return html`
            <button
                type="button"
                .disabled=${this.disabled}
                class=${classMap({
                    button: true,
                    pending: this.pending,
                })}
            >
                <span>${this.value}</span>
            </button>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --text-color: var(--primary-text-color);
                --text-color-disabled: rgb(var(--rgb-disabled));
                --bg-color: rgba(var(--rgb-primary-text-color), 0.05);
                --bg-color-disabled: rgba(var(--rgb-disabled), 0.2);
                height: var(--control-height);
                width: calc(var(--control-height) * var(--control-button-ratio) * 1.2);
                flex: none;
            }
            .button {
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                border-radius: var(--control-border-radius);
                border: none;
                background-color: var(--bg-color);
                transition: background-color 280ms ease-in-out;
                font-size: var(--control-height);
                margin: 0;
                padding: 10px;
                box-sizing: border-box;
                line-height: 0;
            }
            .button.pending span {
                opacity: 0.5;
            }
            .button:disabled {
                cursor: not-allowed;
                background-color: var(--bg-color-disabled);
            }
            .button span {
                font-size: 0.33em;
                font-weight: bold;
                color: var(--text-color);
            }
            .button:disabled span {
                color: var(--text-color-disabled);
            }
        `;
    }
}
