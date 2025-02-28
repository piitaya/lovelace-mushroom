import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "../../../ha";
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
              ${this.hass.formatEntityState(this.entity, option)}
            </mwc-list-item>
          `;
        })}
      </mushroom-select>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: flex;
        height: 100%;
        align-items: center;
      }
      mushroom-select {
        --select-height: var(--control-height);
        width: 100%;
      }
    `;
  }
}
