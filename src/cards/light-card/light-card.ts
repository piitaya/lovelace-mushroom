import {
    computeStateDisplay,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/state-item";
import "../../shared/slider-item";
import { registerCustomCard } from "../../utils/custom-cards";
import { LIGHT_CARD_EDITOR_NAME, LIGHT_CARD_NAME } from "./const";
import "./light-card-editor";

export interface LightCardConfig extends LovelaceCardConfig {
    entity: string;
    icon?: string;
    name?: string;
    show_brightness_control?: boolean;
}

registerCustomCard({
    type: LIGHT_CARD_NAME,
    name: "Mushroom Light Card",
    description: "Card for light entity",
});

@customElement(LIGHT_CARD_NAME)
export class LightCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(
            LIGHT_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<LightCardConfig> {
        const entities = Object.keys(hass.states);
        const lights = entities.filter(
            (e) => e.substr(0, e.indexOf(".")) === "light"
        );
        return {
            type: `custom:${LIGHT_CARD_NAME}`,
            entity: lights[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: LightCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: LightCardConfig): void {
        this._config = config;
    }

    clickHandler(): void {
        this.hass.callService("light", "toggle", {
            entity_id: this._config?.entity,
        });
    }

    sliderChangeHandler(e): void {
        const value = e.detail.value;
        this.hass.callService("light", "turn_on", {
            entity_id: this._config?.entity,
            brightness_pct: value,
        });
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass) {
            return html``;
        }

        const entity = this._config.entity;
        const entity_state = this.hass.states[entity];

        const name = this._config.name ?? entity_state.attributes.friendly_name;
        const icon = this._config.icon ?? stateIcon(entity_state);

        const state = entity_state.state;

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity_state,
            this.hass.locale
        );

        const brightness =
            entity_state.attributes.brightness != null
                ? Math.round((entity_state.attributes.brightness * 100) / 255)
                : undefined;

        return html`<ha-card>
            <mushroom-state-item
                .icon=${icon}
                .name=${name}
                .value=${brightness != null ? `${brightness}%` : stateDisplay}
                .active=${state === "on"}
                @click=${this.clickHandler}
            ></mushroom-state-item>
            ${this._config?.show_brightness_control
                ? html`<mushroom-slider-item
                      .value=${brightness}
                      .disabled=${state !== "on"}
                      @change=${this.sliderChangeHandler}
                  >
                  </mushroom-slider-item>`
                : null}
        </ha-card>`;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --rgb-color: 255, 145, 1;
            }
            ha-card {
                display: flex;
                flex-direction: column;
                padding: 12px;
            }
            ha-card > *:not(:last-child) {
                margin-bottom: 12px;
            }
            mushroom-state-item {
                cursor: pointer;
                --icon-main-color: rgba(var(--rgb-color), 1);
                --icon-shape-color: rgba(var(--rgb-color), 0.2);
            }
            mushroom-slider-item {
                --main-color: rgba(var(--rgb-color), 1);
                --bg-color: rgba(var(--rgb-color), 0.2);
            }
        `;
    }
}
