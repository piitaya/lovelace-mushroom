import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import setupCustomlocalize from "../../localize";
import { INFOS } from "../../utils/info";

@customElement("mushroom-info-picker")
export class InfoPicker extends LitElement {
    @property() public label = "";

    @property() public value?: string;

    @property() public configValue = "";

    @property() public infos: string[] = [...INFOS];

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
                    ${customLocalize("editor.form.info_picker.values.default")}
                </mwc-list-item>
                ${this.infos.map((info) => {
                    return html`
                        <mwc-list-item .value=${info}>
                            ${customLocalize(`editor.form.info_picker.values.${info}`) ||
                            capitalizeFirstLetter(info)}
                        </mwc-list-item>
                    `;
                })}
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

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
