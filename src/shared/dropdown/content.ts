import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("mushroom-dropdown-content")
export class DropdownContent extends LitElement {
    @state() public open: boolean = false;

    protected shouldUpdate(changedProps: PropertyValues): boolean {
        if (changedProps.has("open")) return true;
        return false;
    }

    protected render(): TemplateResult {
        return html`
            <div class="${classMap({ container: true, closed: !this.open })}">
                <div class="divider"></div>
                <div class="container">
                    <slot></slot>
                </div>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            .container {
                display: flex;
                flex-direction: column;
            }
            .container.closed {
                display: none;
            }
            .divider {
                height: 1px;
                background-color: #727272;
                opacity: 0.25;
                margin: 12px -12px;
            }
        `;
    }
}
