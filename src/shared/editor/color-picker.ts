import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import setupCustomlocalize from "../../localize";
import { COLORS, computeColorName, computeRgbColor } from "../../utils/colors";

@customElement("mushroom-color-picker")
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
                    ${customLocalize("editor.form.color_picker.values.default")}
                </mwc-list-item>
                ${COLORS.map(
                    (color) => html`
                        <mwc-list-item .value=${color} graphic="icon">
                            ${computeColorName(color)}
                            <mwc-icon slot="graphic">${this.renderColorCircle(color)}</mwc-icon>
                        </mwc-list-item>
                    `
                )}
            </mwc-select>
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
            mwc-select {
                width: 100%;
            }
            .circle-color {
                display: block;
                background-color: rgb(var(--main-color));
                border-radius: 10px;
                width: 20px;
                height: 20px;
            }
        `;
    }
}
