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

    _selectChanged(ev) {
        const value = ev.target.value;
        this.dispatchEvent(
            new CustomEvent("value-changed", {
                detail: {
                    value: value !== "default" ? value : undefined,
                },
            })
        );
    }

    render() {
        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <mwc-select
                .label=${this.label}
                .configValue=${this.configValue}
                @selected=${this._selectChanged}
                @closed=${(e) => e.stopPropagation()}
                .value=${this.value || "default"}
                fixedMenuPosition
                naturalMenuWidth
            >
                <mwc-list-item value="default">
                    ${customLocalize("editor.form.layout_picker.values.default")}
                </mwc-list-item>
                <mwc-list-item .value=${"vertical"}>
                    ${customLocalize("editor.form.layout_picker.values.vertical")}
                </mwc-list-item>
                <mwc-list-item .value=${"horizontal"}>
                    ${customLocalize("editor.form.layout_picker.values.horizontal")}
                </mwc-list-item>
            </mwc-select>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mwc-select {
                width: 100%;
            }
        `;
    }
}
