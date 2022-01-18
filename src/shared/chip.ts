import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("mushroom-chip")
export class BadgeIcon extends LitElement {
    @property() public icon: string = "";

    @property() public label: string = "";

    protected render(): TemplateResult {
        return html`
            <ha-card class="chip">
                ${
                    this.icon
                        ? html`<ha-icon .icon=${this.icon}></ha-icon>`
                        : null
                }
                ${this.label ? html`<span>${this.label}</span>` : null}
            </button>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            .chip {
                height: 36px;
                width: auto;
                padding: 0 12px;
                border-radius: 18px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
            }
            ha-icon {
                display: flex;
                --mdc-icon-size: 16px;
            }
            span {
                font-weight: bold;
                font-size: 12px;
                line-height: 1;
            }
            .chip *:not(:last-child) {
                margin-right: 4px;
            }
        `;
    }
}
