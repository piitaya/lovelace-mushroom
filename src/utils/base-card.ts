import { HassEntity } from "home-assistant-js-websocket";
import { html, TemplateResult } from "lit";
import { computeStateDisplay, HomeAssistant, isActive, isAvailable } from "../ha";
import "../shared/badge-icon";
import "../shared/card";
import { Appearance } from "../shared/config/appearance-config";
import "../shared/shape-avatar";
import "../shared/shape-icon";
import "../shared/state-info";
import "../shared/state-item";
import { MushroomBaseElement } from "./base-element";
import { computeEntityPicture, computeInfoDisplay } from "./info";

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

    protected renderStateInfo(
        entity: HassEntity,
        appearance: Appearance,
        name: string,
        state?: string
    ): TemplateResult | null {
        const defaultState = computeStateDisplay(
            this.hass.localize,
            entity,
            this.hass.locale,
            this.hass.entities,
            this.hass.connection.haVersion
        );
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
