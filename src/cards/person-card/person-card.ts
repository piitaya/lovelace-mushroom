import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    isAvailable,
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
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
import { PERSON_CARD_EDITOR_NAME, PERSON_CARD_NAME, PERSON_ENTITY_DOMAINS } from "./const";
import { PersonCardConfig } from "./person-card-config";
import { getStateColor, getStateIcon } from "./utils";

registerCustomCard({
    type: PERSON_CARD_NAME,
    name: "Mushroom Person Card",
    description: "Card for person entity",
});

@customElement(PERSON_CARD_NAME)
export class PersonCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./person-card-editor");
        return document.createElement(PERSON_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<PersonCardConfig> {
        const entities = Object.keys(hass.states);
        const people = entities.filter((e) => PERSON_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${PERSON_CARD_NAME}`,
            entity: people[0],
        };
    }

    @state() private _config?: PersonCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: PersonCardConfig): void {
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

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const appearance = computeAppearance(this._config);
        const picture = computeEntityPicture(entity, appearance.icon_type);

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
                        ${this.renderStateInfo(entity, appearance, name)};
                    </mushroom-state-item>
                </mushroom-card>
            </ha-card>
        `;
    }

    renderStateBadge(entity: HassEntity) {
        const zones = Object.values(this.hass.states).filter((entity) =>
            entity.entity_id.startsWith("zone.")
        );
        const icon = getStateIcon(entity, zones);
        const color = getStateColor(entity, zones);

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

    renderBadge(entity: HassEntity) {
        const unavailable = !isAvailable(entity);
        if (unavailable) {
            return super.renderBadge(entity);
        } else {
            return this.renderStateBadge(entity);
        }
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                ${hasAction(this._config.tap_action) ||
                    hasAction(this._config.hold_action) ||
                    hasAction(this._config.double_tap_action)
                        ? html`mushroom-state-item { cursor: pointer; }`
                        : null}
            `,
        ];
    }
}
