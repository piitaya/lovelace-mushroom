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
                        ${customLocalize("editor.form.info_picker.values.default")}
                    </paper-item>
                    ${this.infos.map((info) => {
                        return html`
                            <paper-item .value=${info}>
                                ${customLocalize(`editor.form.info_picker.values.${info}`) ||
                                capitalizeFirstLetter(info)}
                            </paper-item>
                        `;
                    })}
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

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
