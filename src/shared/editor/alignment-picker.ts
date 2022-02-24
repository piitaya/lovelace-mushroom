import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import setupCustomlocalize from "../../localize";
import "./../form/mushroom-select";

export const ALIGNMENT = ["start", "end", "center", "justify"];

@customElement("mushroom-alignment-picker")
export class ColorPicker extends LitElement {
    @property() public label = "";

    @property() public value?: string;

    @property() public configValue = "";

    @property() public hass!: HomeAssistant;

    _selectChanged(ev) {
        const value = ev.target.value;
        this.dispatchEvent(
            new CustomEvent("value-changed", {
                detail: {
                    value: value !== "default" ? value : "",
                },
            })
        );
    }

    render() {
        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <mushroom-select
                .label=${this.label}
                .configValue=${this.configValue}
                @selected=${this._selectChanged}
                @closed=${(e) => e.stopPropagation()}
                .value=${this.value || "default"}
                fixedMenuPosition
                naturalMenuWidth
            >
                <mwc-list-item value="default">
                    ${customLocalize("editor.card.chips.alignment_values.default")}
                </mwc-list-item>
                ${ALIGNMENT.map((alignment) => {
                    return html`
                        <mwc-list-item .value=${alignment}>
                            ${customLocalize(`editor.card.chips.alignment_values.${alignment}`)}
                        </mwc-list-item>
                    `;
                })}
            </mushroom-select>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-select {
                width: 100%;
            }
        `;
    }
}
