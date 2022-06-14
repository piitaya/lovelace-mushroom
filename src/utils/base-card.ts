import { HassEntity } from "home-assistant-js-websocket";
import { html, TemplateResult } from "lit";
import { HomeAssistant, isActive, isAvailable } from "../ha";
import "../shared/badge-icon";
import "../shared/card";
import "../shared/shape-avatar";
import "../shared/shape-icon";
import "../shared/state-info";
import "../shared/state-item";
import { MushroomBaseElement } from "./base-element";

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
}
