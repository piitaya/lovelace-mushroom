import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import "./shape-icon";

@customElement("mushroom-state-item")
export class StateItem extends LitElement {
    @property() public icon: string = "";

    @property() public picture_url?: string | null;

    @property() public name: string = "";

    @property() public value?: string;

    @property() public active: boolean = false;

    @property() public vertical: boolean = false;

    @property() public hide_value: boolean = false;

    @property() public badge_icon?: string;

    @property() public shape_pulse: boolean = false;

    @property() public icon_spin?: boolean;

    @property() public icon_spin_animation_duration?: string;

    private get shape_is_picture(): boolean {
        return !!(this.picture_url && this.picture_url.length > 0);
    }

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    container: true,
                    active: this.active,
                    vertical: this.vertical,
                })}
            >
                <slot name="icon"></slot>
                <slot name="text"></slot>
                <div class="icon-container">
                    ${this.shape_is_picture
                        ? html`
                              <mushroom-shape-avatar
                                  .picture_url=${this.picture_url}
                              ></mushroom-shape-avatar>
                          `
                        : html`
                              <mushroom-shape-icon
                                  .disabled=${!this.active}
                                  .icon=${this.icon}
                                  .pulse=${!!this.shape_pulse}
                                  .spin=${!!this.icon_spin}
                                  .spin_animation_duration=${this
                                      .icon_spin_animation_duration}
                              ></mushroom-shape-icon>
                          `}
                    ${this.badge_icon
                        ? html`
                              <mushroom-badge-icon
                                  .icon=${this.badge_icon}
                              ></mushroom-badge-icon>
                          `
                        : ""}
                </div>
                <div class="text-container">
                    <span class="info-name">${this.name}</span>
                    ${this.value && !this.hide_value
                        ? html`<span class="info-value">${this.value}</span>`
                        : null}
                </div>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-shape-icon {
                --main-color: var(--icon-main-color);
                --shape-color: var(--icon-shape-color);
            }
            mushroom-badge-icon {
                --main-color: var(--badge-main-color);
                --shape-color: var(--badge-shape-color);
            }
            .container {
                display: flex;
                flex-direction: row;
                align-items: center;
            }
            .container:not(.vertical) > *:not(:last-child) {
                margin-right: 12px;
            }
            .icon-container {
                position: relative;
            }
            mushroom-badge-icon {
                position: absolute;
                top: -3px;
                right: -3px;
            }
            .info-container {
                min-width: 0;
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            .info-name {
                font-weight: bold;
                font-size: 14px;
                color: var(--primary-text-color);
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            .info-value {
                font-weight: bolder;
                font-size: 12px;
                color: var(--secondary-text-color);
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            .container.vertical {
                flex-direction: column;
            }
            .container.vertical > *:not(:last-child) {
                margin-bottom: 12px;
            }
            .container.vertical .info-container {
                text-align: center;
            }
        `;
    }
}
