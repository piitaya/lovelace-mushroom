import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  atLeastHaVersion,
  HomeAssistant,
  isAvailable,
  supportsFeature,
  VacuumEntity,
  VACUUM_SUPPORT_FAN_SPEED,
} from "../../../ha";

export const isFanSpeedControlSupported = (entity: VacuumEntity) =>
  supportsFeature(entity, VACUUM_SUPPORT_FAN_SPEED) &&
  Array.isArray(entity.attributes.fan_speed_list) &&
  entity.attributes.fan_speed_list.length > 0;

@customElement("mushroom-vacuum-fan-speed-control")
export class VacuumFanSpeedControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: VacuumEntity;

  _selectChanged(ev) {
    let value: string | undefined;
    if (atLeastHaVersion(this.hass.connection.haVersion, 2026, 3)) {
      value = ev.detail.item.value;
    } else {
      value = ev.target.value;
    }

    if (value && value !== this.entity.attributes.fan_speed) {
      this.hass.callService("vacuum", "set_fan_speed", {
        entity_id: this.entity.entity_id,
        fan_speed: value,
      });
    }
  }

  private _formatOption(option: string) {
    return this.hass.formatEntityAttributeValue(
      this.entity,
      "fan_speed",
      option
    );
  }

  render() {
    const value = this.entity.attributes.fan_speed ?? "";
    const options: string[] = this.entity.attributes.fan_speed_list ?? [];
    const label = this.hass.formatEntityAttributeName(this.entity, "fan_speed");

    if (atLeastHaVersion(this.hass.connection.haVersion, 2026, 3)) {
      return html`
        <ha-control-select-menu
          show-arrow
          hide-label
          .label=${label}
          .hass=${this.hass}
          .value=${value}
          .disabled=${!isAvailable(this.entity)}
          .options=${options.map((option) => ({
            value: option,
            label: this._formatOption(option),
          }))}
          @wa-select=${this._selectChanged}
        >
          <ha-icon slot="icon" icon="mdi:fan"></ha-icon>
        </ha-control-select-menu>
      `;
    }

    return html`
      <ha-control-select-menu
        show-arrow
        hide-label
        .label=${label}
        .hass=${this.hass}
        .value=${value}
        .disabled=${!isAvailable(this.entity)}
        fixedMenuPosition
        naturalMenuWidth
        @closed=${(e) => e.stopPropagation()}
        @selected=${this._selectChanged}
      >
        <ha-icon slot="icon" icon="mdi:fan"></ha-icon>
        ${options.map(
          (option) => html`
            <ha-list-item .value=${option}>
              ${this._formatOption(option)}
            </ha-list-item>
          `
        )}
      </ha-control-select-menu>
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
