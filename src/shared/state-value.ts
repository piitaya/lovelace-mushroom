import { css, CSSResultGroup, html, LitElement, TemplateResult, unsafeCSS } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("shroom-state-value")
export class StateValue extends LitElement {
    @property() public value: string = "";
    @property() public color: string = "var(--secondary-text-color)";

    protected render(): TemplateResult {
        return html`<div class="button" style="color: ${this.color}">${this.value}</div>`;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --icon-color: var(--primary-text-color);
                --bg-color: rgba(var(--rgb-primary-text-color), 0.05);
                width: 42px;
                height: 42px;
                flex: none;
            }
            .button {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                height: 100%;
                width: 100%;
                border-radius: var(--control-border-radius);
                border: none;
                background-color: var(--bg-color);
                transition: background-color 280ms ease-in-out;
            }
        `;
    }
}
