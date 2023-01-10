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
            this._setValue(value);
        }
    }

    _setValue(option) {
        const entity_id = this.entity.entity_id;
        const domain = entity_id.split(".")[0];

        this.hass.callService(domain, "select_option", {
            entity_id: this.entity.entity_id,
            option: option,
        });
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
                    return html` <mwc-list-item .value=${option}> ${option} </mwc-list-item> `;
                })}
            </mushroom-select>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-select {
                --select-height: 42px;
                width: 100%;
            }
        `;
    }
}
