import { ActionConfig, HomeAssistant } from "custom-card-helpers";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

const DEFAULT_ACTIONS = ["toggle", "more-info", "navigate", "url", "call-service", "none"];

@customElement("mushroom-action-picker")
export class ActionPicker extends LitElement {
    @property() public label = "";

    @property() public value?: ActionConfig[];

    @property() public configValue = "";

    @property() public actions?: ActionConfig["action"][];

    @property() public hass!: HomeAssistant;

    _actionChanged(ev: CustomEvent) {
        const value = ev.detail.value;
        this.dispatchEvent(
            new CustomEvent("value-changed", {
                detail: {
                    value,
                },
            })
        );
    }

    render() {
        return html`
            <hui-action-editor
                .label=${this.label}
                .configValue=${this.configValue}
                .hass=${this.hass}
                .config=${this.value}
                .actions=${this.actions || DEFAULT_ACTIONS}
                @value-changed=${this._actionChanged}
            ></hui-action-editor>
        `;
    }
}
