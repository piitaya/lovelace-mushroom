import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { Layout } from "../utils/layout";

@customElement("mushroom-card")
export class Card extends LitElement {
    @property() public layout: Layout = "default";

    protected render(): TemplateResult {
        return this.renderContent();
    }

    renderContent() {
        return html`
            <div
                class=${classMap({
                    container: true,
                    horizontal: this.layout === "horizontal",
                })}
            >
                <slot></slot>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            .container {
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
                flex-grow: 0;
                box-sizing: border-box;
                justify-content: center;
            }
            .container > ::slotted(*:not(:last-child)) {
                margin-bottom: var(--spacing);
            }
            .container.horizontal {
                flex-direction: row;
            }
            .container.horizontal > ::slotted(*) {
                flex: 1;
                min-width: 0;
            }
            .container.horizontal > ::slotted(*:not(:last-child)) {
                margin-right: var(--spacing);
                margin-bottom: 0;
            }
            :host([rtl]) .container.horizontal > ::slotted(*:not(:last-child)) {
                margin-right: initial;
                margin-left: var(--spacing);
                margin-bottom: 0;
            }
        `;
    }
}
