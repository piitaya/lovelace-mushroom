import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "../../../ha";
import setupCustomlocalize from "../../../localize";
import { getCurrentOption, getOptions } from "../utils";
import "../../../shared/form/mushroom-select";

@customElement("mushroom-select-option-control")
export class SelectOptionControl extends LitElement {
    @property() public label = "";

    @property() public value?: string;

    @property() public configValue = "";

    @property() public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    _selectChanged(ev) {
        const value = ev.target.value;
        if (value) {
            this.dispatchEvent(
                new CustomEvent("value-changed", {
                    detail: {
                        value,
                    },
                })
            );
            this.hass.callService("input_select", "select_option", {
                entity_id: this.entity.entity_id,
                option: value,
            });
        }
    }

    render() {
        const customLocalize = setupCustomlocalize(this.hass);

        const value = this.value || getCurrentOption(this.entity);

        const options = getOptions(this.entity);

        return html`
            <mushroom-select
                .label=${this.label}
                .configValue=${this.configValue}
                @selected=${this._selectChanged}
                @closed=${(e) => e.stopPropagation()}
                .value=${value}
                naturalMenuWidth
            >
                ${options.map((option) => {
                    return html`
                        <mwc-list-item .value=${option} >
                            ${option}
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
