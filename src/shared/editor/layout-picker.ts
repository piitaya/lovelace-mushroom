import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import setupCustomlocalize from "../../localize";

@customElement("mushroom-layout-picker")
export class LayoutPicker extends LitElement {
    @property() public label = "";

    @property() public value?: string;

    @property() public configValue = "";

    @property() public hass!: HomeAssistant;

    _selectChanged(ev: CustomEvent) {
        const value = ev.detail.item.value;
        this.dispatchEvent(
            new CustomEvent("value-changed", {
                detail: {
                    value,
                },
            })
        );
    }

    render() {
        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <paper-dropdown-menu .label=${this.label}>
                <paper-listbox
                    slot="dropdown-content"
                    attr-for-selected="value"
                    .selected=${this.value ?? ""}
                    .configValue=${this.configValue}
                    @iron-select=${this._selectChanged}
                >
                    <paper-item value="">
                        ${customLocalize("editor.form.layout_picker.values.default")}
                    </paper-item>
                    <paper-item .value=${"vertical"}>
                        ${customLocalize("editor.form.layout_picker.values.vertical")}
                    </paper-item>
                    <paper-item .value=${"horizontal"}>
                        ${customLocalize("editor.form.layout_picker.values.horizontal")}
                    </paper-item>
                </paper-listbox>
            </paper-dropdown-menu>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            paper-dropdown-menu {
                width: 100%;
            }
        `;
    }
}
