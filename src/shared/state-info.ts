import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("mushroom-state-info")
export class StateItem extends LitElement {
    @property() public primary: string = "";

    @property() public secondary?: string;

    protected render(): TemplateResult {
        return html`
            <div class="container">
                <span class="primary">${this.primary}</span>
                ${this.secondary
                    ? html`<span class="secondary">${this.secondary}</span>`
                    : null}
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            .container {
                min-width: 0;
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            .primary {
                font-weight: bold;
                font-size: 14px;
                color: var(--primary-text-color);
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            .secondary {
                font-weight: bolder;
                font-size: 12px;
                color: var(--secondary-text-color);
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
        `;
    }
}
