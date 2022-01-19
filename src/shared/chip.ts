import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("mushroom-chip")
export class BadgeIcon extends LitElement {
    @property() public icon: string = "";

    @property() public label: string = "";

    protected render(): TemplateResult {
        return html`
            <ha-card class="chip">
                <slot></slot>
            </button>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --icon-color: var(--primary-text-color);
                --text-color: var(--primary-text-color);
            }
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
            ::slotted(ha-icon) {
                display: flex;
                --mdc-icon-size: 16px;
                color: var(--icon-color);
            }
            ::slotted(svg) {
                width: 16px;
                height: 16px;
                display: flex;
            }
            ::slotted(span) {
                font-weight: bold;
                font-size: 12px;
                line-height: 1;
                color: var(--text-color);
            }
            ::slotted(*:not(:last-child)) {
                margin-right: 4px;
            }
        `;
    }
}
