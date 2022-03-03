import { ActionHandlerEvent, handleAction, hasAction, HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../../../shared/button";
import { actionHandler } from "../../../utils/directives/action-handler-directive";
import { EntityCardShortcut } from "../entity-card-config";

@customElement("mushroom-entity-shortcuts-control")
export class EntityShortcutsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property() public fill: boolean = false;

    @property() public shortcuts: EntityCardShortcut[] = [];

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    container: true,
                    fill: this.fill,
                })}
            >
                ${this.shortcuts.map((action) => this.renderButton(action))}
            </div>
        `;
    }

    renderButton(shortcut: EntityCardShortcut): TemplateResult {
        const _handleAction = (ev: ActionHandlerEvent) => {
            handleAction(this, this.hass!, shortcut!, ev.detail.action!);
        };

        return html`
            <mushroom-button
                .icon=${shortcut.icon}
                @action=${_handleAction}
                .actionHandler=${actionHandler({
                    hasHold: hasAction(shortcut.hold_action),
                    hasDoubleClick: hasAction(shortcut.double_tap_action),
                })}
            ></mushroom-button>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                flex-direction: row;
                width: 100%;
            }
            :host *:not(:last-child) {
                margin-right: var(--spacing);
            }
            .container {
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
            }
            .container.fill mushroom-button {
                flex: 1;
            }
        `;
    }
}
