import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("mushroom-dropdown-tab")
export class DropdownTab extends LitElement {
    @state() public open: boolean = false;
    @state() public arrow: boolean = true;

    protected render(): TemplateResult {
        return html`
            <div class="container">
                <slot></slot>
                <div class="${classMap({ toggle: true, closed: !this.open, hidden: !this.arrow })}">
                    <ha-icon icon="mdi:chevron-up"></ha-icon>
                </div>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            .container {
                display: flex;
                flex-grow: 1;
                justify-content: space-between;
            }
            .toggle {
                display: flex;
                flex-shrink: 1;
                align-items: center;
            }
            .toggle.closed {
                transform: rotate(180deg);
            }
            .toggle.hidden {
                display: none;
            }
        `;
    }
}
