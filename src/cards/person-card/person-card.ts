import {
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
    stateIcon as stateIconHelper,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import "../../shared/badge-icon";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { PERSON_CARD_EDITOR_NAME, PERSON_CARD_NAME, PERSON_ENTITY_DOMAINS } from "./const";
import { PersonCardConfig } from "./person-card-config";
import "./person-card-editor";
import { getStateColor, getStateIcon, isActive } from "./utils";

registerCustomCard({
    type: PERSON_CARD_NAME,
    name: "Mushroom Person Card",
    description: "Card for person entity",
});

@customElement(PERSON_CARD_NAME)
export class PersonCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
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

    @property({ attribute: false }) public hass!: HomeAssistant;

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

        const name = this._config.name ?? entity.attributes.friendly_name;
        const icon = this._config.icon ?? stateIconHelper(entity);

        const picture = this._config.use_entity_picture
            ? entity.attributes.entity_picture
            : undefined;

        const vertical = !!this._config.vertical;
        const hideState = !!this._config.hide_state;
        const hideName = !!this._config.hide_name;

        const zones = Object.values(this.hass.states).filter((entity) =>
            entity.entity_id.startsWith("zone.")
        );
        const stateIcon = getStateIcon(entity, zones);
        const stateColor = getStateColor(entity, zones);

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const isAvailable = entity.state !== "unavailable";

        return html`
            <ha-card>
                <div class="container">
                    <mushroom-state-item
                        .vertical=${vertical}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                        })}
                    >
                        ${picture
                            ? html`
                                  <mushroom-shape-avatar
                                      slot="icon"
                                      .picture_url=${picture}
                                  ></mushroom-shape-avatar>
                              `
                            : html`
                                  <mushroom-shape-icon
                                      slot="icon"
                                      .icon=${icon}
                                      .disabled=${!isActive(entity)}
                                  ></mushroom-shape-icon>
                              `}
                        ${isAvailable
                            ? this.renderStateBadge(stateIcon, stateColor)
                            : this.renderUnvailableBadge()}
                        <mushroom-state-info
                            slot="info"
                            .primary=${!hideName ? name : undefined}
                            .secondary=${!hideState && stateDisplay}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                </div>
            </ha-card>
        `;
    }

    renderStateBadge(icon: string, color: string) {
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

    renderUnvailableBadge() {
        return html`
            <mushroom-badge-icon
                class="unavailable"
                slot="badge"
                icon="mdi:help"
            ></mushroom-badge-icon>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
            `,
        ];
    }
}
