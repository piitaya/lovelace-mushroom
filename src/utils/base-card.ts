import { HassEntity } from "home-assistant-js-websocket";
import { html, nothing, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { computeRTL, computeStateDisplay, HomeAssistant, isActive, isAvailable } from "../ha";
import setupCustomlocalize from "../localize";
import "../shared/badge-icon";
import "../shared/card";
import { Appearance, AppearanceSharedConfig } from "../shared/config/appearance-config";
import { EntitySharedConfig } from "../shared/config/entity-config";
import "../shared/shape-avatar";
import "../shared/shape-icon";
import "../shared/state-info";
import "../shared/state-item";
import { computeAppearance } from "./appearance";
import { MushroomBaseElement } from "./base-element";
import { computeInfoDisplay } from "./info";

type BaseConfig = EntitySharedConfig & AppearanceSharedConfig;

export function computeDarkMode(hass?: HomeAssistant): boolean {
    if (!hass) return false;
    return (hass.themes as any).darkMode as boolean;
}
export class MushroomBaseCard<
    T extends BaseConfig = BaseConfig,
    E extends HassEntity = HassEntity,
> extends MushroomBaseElement {
    @state() protected _config?: T;

    @property({ attribute: "in-grid", reflect: true, type: Boolean })
    protected _inGrid = false;

    protected get _stateObj(): E | undefined {
        if (!this._config || !this.hass || !this._config.entity) return undefined;

        const entityId = this._config.entity;
        return this.hass.states[entityId] as E;
    }

    protected get hasControls(): boolean {
        return false;
    }

    setConfig(config: T): void {
        this._config = {
            tap_action: {
                action: "more-info",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    public getGridSize(): [number, number] {
        this._inGrid = true;
        let column = 2;
        let row = 1;
        if (!this._config) return [column, row];
        const appearance = computeAppearance(this._config);
        if (appearance.layout === "vertical") {
            row += 1;
        }
        if (appearance.layout === "horizontal") {
            column = 4;
        }
        if (
            appearance?.layout !== "horizontal" &&
            this.hasControls &&
            !("collapsible_controls" in this._config && this._config?.collapsible_controls)
        ) {
            row += 1;
        }
        return [column, row];
    }

    public getCardSize(): number | Promise<number> {
        let height = 1;
        if (!this._config) return height;
        const appearance = computeAppearance(this._config);
        if (appearance.layout === "vertical") {
            height += 1;
        }
        if (
            appearance?.layout !== "horizontal" &&
            this.hasControls &&
            !("collapsible_controls" in this._config && this._config?.collapsible_controls)
        ) {
            height += 1;
        }
        return height;
    }

    protected renderPicture(picture: string): TemplateResult {
        return html`
            <mushroom-shape-avatar
                slot="icon"
                .picture_url=${(this.hass as any).hassUrl(picture)}
            ></mushroom-shape-avatar>
        `;
    }

    protected renderNotFound(config: BaseConfig): TemplateResult {
        const appearance = computeAppearance(config);
        const rtl = computeRTL(this.hass);

        const customLocalize = setupCustomlocalize(this.hass);

        return html`
            <ha-card class=${classMap({ "fill-container": appearance.fill_container })}>
                <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
                    <mushroom-state-item ?rtl=${rtl} .appearance=${appearance} disabled>
                        <mushroom-shape-icon slot="icon" disabled>
                            <ha-icon icon="mdi:help"></ha-icon>
                        </mushroom-shape-icon>
                        <mushroom-badge-icon
                            slot="badge"
                            class="not-found"
                            icon="mdi:exclamation-thick"
                        ></mushroom-badge-icon>
                        <mushroom-state-info
                            slot="info"
                            .primary=${config.entity}
                            .secondary=${customLocalize("card.not_found")}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                </mushroom-card>
            </ha-card>
        `;
    }

    protected renderIcon(stateObj: HassEntity, icon?: string): TemplateResult {
        const active = isActive(stateObj);
        return html`
            <mushroom-shape-icon slot="icon" .disabled=${!active}>
                <ha-state-icon
                    .hass=${this.hass}
                    .stateObj=${stateObj}
                    .state=${stateObj}
                    .icon=${icon}
                ></ha-state-icon
            ></mushroom-shape-icon>
        `;
    }

    protected renderBadge(stateObj: HassEntity) {
        const unavailable = !isAvailable(stateObj);
        return unavailable
            ? html`
                  <mushroom-badge-icon
                      class="unavailable"
                      slot="badge"
                      icon="mdi:help"
                  ></mushroom-badge-icon>
              `
            : nothing;
    }

    protected renderStateInfo(
        stateObj: HassEntity,
        appearance: Appearance,
        name: string,
        state?: string
    ): TemplateResult | null {
        const defaultState = this.hass.formatEntityState
            ? this.hass.formatEntityState(stateObj)
            : computeStateDisplay(
                  this.hass.localize,
                  stateObj,
                  this.hass.locale,
                  this.hass.config,
                  this.hass.entities
              );
        const displayState = state ?? defaultState;

        const primary = computeInfoDisplay(
            appearance.primary_info,
            name,
            displayState,
            stateObj,
            this.hass
        );

        const secondary = computeInfoDisplay(
            appearance.secondary_info,
            name,
            displayState,
            stateObj,
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
