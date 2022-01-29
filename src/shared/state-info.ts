import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("mushroom-state-info")
export class StateItem extends LitElement {
    @property() public label: string = "";

    @property() public value?: string;

    @property() public hide_value: boolean = false;

    protected render(): TemplateResult {
        return html`
            <div class="container">
                <span class="label">${this.label}</span>
                ${this.value && !this.hide_value
                    ? html`<span class="value">${this.value}</span>`
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
            .label {
                font-weight: bold;
                font-size: 14px;
                color: var(--primary-text-color);
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            .value {
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
