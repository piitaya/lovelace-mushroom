import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import setupCustomlocalize from "../../localize";
import { COLORS, computeColorName, computeRgbColor } from "../../utils/colors";

@customElement("mushroom-color-picker")
export class ColorPicker extends LitElement {
    @property() public label = "";

    @property() public value = "";

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
                    .selected=${this.value}
                    .configValue=${"icon_color"}
                    @iron-select=${this._selectChanged}
                >
                    <paper-item value=""
                        >${customLocalize(
                            "editor.form.color_picker.color_values.default"
                        )}</paper-item
                    >
                    ${COLORS.map(
                        (color) => html`
                            <paper-item .value=${color}>
                                ${this.renderColorCircle(color)} ${computeColorName(color)}
                            </paper-item>
                        `
                    )}
                </paper-listbox>
            </paper-dropdown-menu>
        `;
    }

    private renderColorCircle(color: string) {
        return html`
            <span
                class="circle-color"
                style=${styleMap({
                    "--main-color": computeRgbColor(color),
                })}
            ></span>
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
