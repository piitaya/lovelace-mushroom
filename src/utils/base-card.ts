import { HassEntity } from "home-assistant-js-websocket";
import { html, TemplateResult } from "lit";
import { computeStateDisplay, HomeAssistant, isActive, isAvailable } from '../ha';
import "../shared/badge-icon";
import "../shared/card";
import { Appearance } from "../shared/config/appearance-config";
import "../shared/shape-avatar";
import "../shared/shape-icon";
import "../shared/state-info";
import "../shared/state-item";
import { MushroomBaseElement } from "./base-element";
import { computeInfoDisplay } from "./info";
import { styleMap } from "lit/directives/style-map.js";

export function computeDarkMode(hass?: HomeAssistant): boolean {
    if (!hass) return false;
    return (hass.themes as any).darkMode as boolean;
}
export class MushroomBaseCard extends MushroomBaseElement {
    protected renderPicture(picture: string): TemplateResult {
        return html`
            <mushroom-shape-avatar
                slot="icon"
                .picture_url=${(this.hass as any).hassUrl(picture)}
            ></mushroom-shape-avatar>
        `;
    }

    protected renderIcon(entity: HassEntity, icon: string): TemplateResult {
        const active = isActive(entity);
        return html`
            <mushroom-shape-icon
                slot="icon"
                .disabled=${!active}
                .icon=${icon}
            ></mushroom-shape-icon>
        `;
    }

    protected renderBadge(entity: HassEntity): TemplateResult | null {
        const unavailable = !isAvailable(entity);
        return unavailable
            ? html`
                  <mushroom-badge-icon
                      class="unavailable"
                      slot="badge"
                      icon="mdi:help"
                  ></mushroom-badge-icon>
              `
            : null;
    }

    protected renderBatteryBadge(entity: HassEntity): TemplateResult | null {
        const level = entity.attributes.battery_level;
        const color = level > 40 ? "var(--rgb-success)" : level > 20 ? "var(--rgb-warning)" : "var(--rgb-danger)";
        const iconStyle = {
            "--main-color": `rgb(${color})`,
        };

        return  html`
              <mushroom-badge-icon
                class="battery"
                slot="badge"
                style=${styleMap(iconStyle)}
                icon=${entity.attributes.battery_icon}
              ></mushroom-badge-icon>
          `;
    }

    protected renderStateInfo(
        entity: HassEntity,
        appearance: Appearance,
        name: string,
        state?: string
    ): TemplateResult | null {
        const defaultState = computeStateDisplay(this.hass.localize, entity, this.hass.locale);
        const displayState = state ?? defaultState;

        const primary = computeInfoDisplay(
            appearance.primary_info,
            name,
            displayState,
            entity,
            this.hass
        );

        const secondary = computeInfoDisplay(
            appearance.secondary_info,
            name,
            displayState,
            entity,
            this.hass
        );

        return html`
            <mushroom-state-info
                slot="info"
                .primary=${primary}
                .secondary=${secondary}
            ></mushroom-state-info>
        `;
    }
}
