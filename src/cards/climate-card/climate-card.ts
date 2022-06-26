import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    ClimateEntity,
    computeRTL,
    computeStateDisplay,
    formatNumber,
    handleAction,
    hasAction,
    HomeAssistant,
    HvacAction,
    HvacMode,
    isActive,
    isAvailable,
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { stateIcon } from "../../utils/icons/state-icon";
import { computeEntityPicture } from "../../utils/info";
import { ClimateCardConfig } from "./climate-card-config";
import { CLIMATE_CARD_EDITOR_NAME, CLIMATE_CARD_NAME, CLIMATE_ENTITY_DOMAINS } from "./const";
import { getHvacActionColor, getHvacActionIcon, getHvacModeColor } from "./utils";

type ClimateCardControl = "buttons_control" | "position_control";

registerCustomCard({
    type: CLIMATE_CARD_NAME,
    name: "Mushroom Climate Card",
    description: "Card for climate entity",
});

@customElement(CLIMATE_CARD_NAME)
export class ClimateCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./climate-card-editor");
        return document.createElement(CLIMATE_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<ClimateCardConfig> {
        const entities = Object.keys(hass.states);
        const climates = entities.filter((e) => CLIMATE_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${CLIMATE_CARD_NAME}`,
            entity: climates[0],
        };
    }

    @state() private _config?: ClimateCardConfig;

    @state() private _activeControl?: ClimateCardControl;

    @state() private _controls: ClimateCardControl[] = [];

    get _nextControl(): ClimateCardControl | undefined {
        if (this._activeControl) {
            return (
                this._controls[this._controls.indexOf(this._activeControl) + 1] ?? this._controls[0]
            );
        }
        return undefined;
    }

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: ClimateCardConfig): void {
        this._config = {
            tap_action: {
                action: "toggle",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id] as ClimateEntity;

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const appearance = computeAppearance(this._config);
        const picture = computeEntityPicture(entity, appearance.icon_type);

        let stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);
        if (entity.attributes.current_temperature !== null) {
            const temperature = formatNumber(
                entity.attributes.current_temperature,
                this.hass.locale
            );
            const unit = this.hass.config.unit_system.temperature;
            stateDisplay += ` - ${temperature} ${unit}`;
        }
        const rtl = computeRTL(this.hass);

        return html`
            <ha-card class=${classMap({ "fill-container": appearance.fill_container })}>
                <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .appearance=${appearance}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        ${picture ? this.renderPicture(picture) : this.renderIcon(entity, icon)}
                        ${this.renderBadge(entity)}
                        ${this.renderStateInfo(entity, appearance, name, stateDisplay)};
                    </mushroom-state-item>
                </mushroom-card>
            </ha-card>
        `;
    }

    protected renderIcon(entity: ClimateEntity, icon: string): TemplateResult {
        const available = isAvailable(entity);
        const color = getHvacModeColor(entity.state as HvacMode);
        const iconStyle = {};
        iconStyle["--icon-color"] = `rgb(${color})`;
        iconStyle["--shape-color"] = `rgba(${color}, 0.2)`;

        return html`
            <mushroom-shape-icon
                slot="icon"
                .disabled=${!available}
                .icon=${icon}
                style=${styleMap(iconStyle)}
            ></mushroom-shape-icon>
        `;
    }

    protected renderBadge(entity: ClimateEntity) {
        const unavailable = !isAvailable(entity);
        if (unavailable) {
            return super.renderBadge(entity);
        } else {
            return this.renderActionBadge(entity);
        }
    }

    renderActionBadge(entity: ClimateEntity) {
        const hvac_action = entity.attributes.hvac_action;
        if (!hvac_action || hvac_action == "off" || hvac_action === "idle") return null;

        const color = getHvacActionColor(hvac_action);
        const icon = getHvacActionIcon(hvac_action);

        if (!icon) return null;

        return html`
            <mushroom-badge-icon
                slot="badge"
                .icon=${icon}
                style=${styleMap({
                    "--main-color": `rgb(${color})`,
                })}
            ></mushroom-badge-icon>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
            `,
        ];
    }
}
