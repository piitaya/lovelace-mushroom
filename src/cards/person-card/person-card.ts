import {
    ActionConfig,
    computeStateDisplay,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
    handleAction,
    ActionHandlerEvent,
    hasAction,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/shape-icon";
import "../../shared/shape-avatar";
import "../../shared/badge-icon";
import { registerCustomCard } from "../../utils/custom-cards";
import {
    PERSON_CARD_EDITOR_NAME,
    PERSON_CARD_NAME,
    PERSON_ENTITY_DOMAINS,
} from "./const";
import "./person-card-editor";
import { styleMap } from "lit/directives/style-map.js";
import { actionHandler } from "../../utils/directives/action-handler-directive";

/*
 * TODO: make configurable icons, icons according to zone, show state indicator
 */
export interface PersonCardConfig extends LovelaceCardConfig {
    entity: string;
    icon?: string;
    vertical?: boolean;
    hide_state?: boolean;
    use_entity_picture?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
}

registerCustomCard({
    type: PERSON_CARD_NAME,
    name: "Mushroom Person Card",
    description: "Card for person entity",
});

@customElement(PERSON_CARD_NAME)
export class PersonCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(
            PERSON_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<PersonCardConfig> {
        const entities = Object.keys(hass.states);
        const people = entities.filter((e) =>
            PERSON_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
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
        if (!this._config || !this.hass) {
            return html``;
        }

        const entity = this._config.entity;
        const entity_state = this.hass.states[entity];

        const name = this._config.name ?? entity_state.attributes.friendly_name;
        let icon = this._config.icon ?? "mdi:face-man";
        let picture: string | null = null;
        if (
            this._config.use_entity_picture &&
            entity_state.attributes.entity_picture
        ) {
            picture = entity_state.attributes.entity_picture;
        }
        const vertical = !!this._config.vertical;
        const hide_state = !!this._config.hide_state;

        const state = entity_state.state;
        let state_icon = "mdi:pine-tree";
        let state_color = "var(--state-not_home-color)";
        if (state === "unknown") {
            state_icon = "mdi:map-marker-alert";
            state_color = "var(--state-unknown-color)";
        } else if (state === "home") {
            state_icon = "mdi:home";
            state_color = "var(--state-home-color)";
        }

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity_state,
            this.hass.locale
        );

        return html`<ha-card>
            <mushroom-state-item
                style=${styleMap({
                    "--badge-main-color": state_color,
                })}
                .icon=${icon}
                .badge_icon=${state_icon}
                .name=${name}
                .value=${stateDisplay}
                .active=${state === "on"}
                .picture_url=${picture}
                .vertical=${vertical}
                .hide_value=${hide_state}
                @action=${this._handleAction}
                .actionHandler=${actionHandler({
                    hasHold: hasAction(this._config.hold_action),
                })}
            ></mushroom-state-item>
        </ha-card>`;
    }

    static get styles(): CSSResultGroup {
        return css`
            ha-card {
                display: flex;
                flex-direction: column;
                padding: 12px;
            }
            mushroom-state-item {
                cursor: pointer;
            }
        `;
    }
}
