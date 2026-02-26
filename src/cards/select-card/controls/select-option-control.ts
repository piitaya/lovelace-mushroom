import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "../../../ha";
import { getCurrentOption, getOptions } from "../utils";

@customElement("mushroom-select-option-control")
export class SelectOptionControl extends LitElement {
  @property() public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: HassEntity;

  _selectChanged(ev: CustomEvent) {
    const value = ev.detail.item.value;

    const currentValue = getCurrentOption(this.entity);

    if (value && value !== currentValue) {
      this._setValue(value);
    }
  }

  _setValue(option: string) {
    const entityId = this.entity.entity_id;
    const domain = entityId.split(".")[0];

    this.hass.callService(domain, "select_option", {
      entity_id: this.entity.entity_id,
      option: option,
    });
  }

  render() {
    const value = getCurrentOption(this.entity);

    const options = getOptions(this.entity).map((option) => ({
      value: option,
      label: this.hass.formatEntityState(this.entity, option),
    }));

    return html`
      <ha-control-select-menu
        show-arrow
        hide-label
        .hass=${this.hass}
        .value=${value ?? ""}
        .options=${options}
        @wa-select=${this._selectChanged}
      ></ha-control-select-menu>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: flex;
        height: 100%;
        align-items: center;
      }
      ha-control-select-menu {
        width: 100%;
        --control-select-menu-height: var(--control-height);
        --control-select-menu-border-radius: var(--control-border-radius);
      }
    `;
  }
}
