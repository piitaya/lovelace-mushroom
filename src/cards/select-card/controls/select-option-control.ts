import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { computeStateDisplay, HomeAssistant } from "../../../ha";
import "../../../shared/form/mushroom-select";
import { getCurrentOption, getOptions } from "../utils";

@customElement("mushroom-select-option-control")
export class SelectOptionControl extends LitElement {
    @property() public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    _selectChanged(ev) {
        const value = ev.target.value;

        const currentValue = getCurrentOption(this.entity);

        if (value && value !== currentValue) {
            this._setValue(value);
        }
    }

    _setValue(option) {
        const entityId = this.entity.entity_id;
        const domain = entityId.split(".")[0];

        this.hass.callService(domain, "select_option", {
            entity_id: this.entity.entity_id,
            option: option,
        });
    }

    render() {
        const value = getCurrentOption(this.entity);

        const options = getOptions(this.entity);

        return html`
            <mushroom-select
                @selected=${this._selectChanged}
                @closed=${(e) => e.stopPropagation()}
                .value=${value ?? ""}
                naturalMenuWidth
                fixedMenuPosition
            >
                ${options.map((option) => {
                    return html`
                        <mwc-list-item .value=${option}>
                            ${this.hass.formatEntityState
                                ? this.hass.formatEntityState(this.entity, option)
                                : computeStateDisplay(
                                      this.hass.localize,
                                      this.entity,
                                      this.hass.locale,
                                      this.hass.config,
                                      this.hass.entities,
                                      option
                                  )}
                        </mwc-list-item>
                    `;
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
