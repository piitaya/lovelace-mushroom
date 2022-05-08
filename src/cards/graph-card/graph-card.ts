import {
    ActionHandlerEvent,
    computeRTL,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { isActive, isAvailable } from "../../ha/data/entity";
import { fetchRecent } from "../../ha/data/history";
import { coordinates } from "../../shared/graph/coordinates";
import "../../shared/graph/graph-base";
import { MushroomBaseElement } from "../../utils/base-element";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { getInfo } from "../../utils/info";
import { getLayoutFromConfig } from "../../utils/layout";
import {
    GRAPH_CARD_EDITOR_NAME,
    GRAPH_CARD_NAME,
    GRAPH_DEFAULT_HOURS,
    GRAPH_ENTITY_DOMAINS,
    GRAPH_HEIGHT_COMPACT,
    GRAPH_HEIGHT_COMPACT_MARGIN,
    GRAPH_HEIGHT_STANDARD,
    GRAPH_HEIGHT_STANDARD_MARGIN,
    GRAPH_HOUR,
    GRAPH_MINUTE,
} from "./const";
import { GraphCardConfig } from "./graph-card-config";

registerCustomCard({
    type: GRAPH_CARD_NAME,
    name: "Mushroom Graph Card",
    description: "Graph Card for sensor entity",
});

@customElement(GRAPH_CARD_NAME)
export class GraphCard extends MushroomBaseElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./graph-card-editor");
        return document.createElement(GRAPH_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<GraphCardConfig> {
        const entities = Object.keys(hass.states);
        const entity = entities.filter((e) => GRAPH_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${GRAPH_CARD_NAME}`,
            entity: entity[0],
        };
    }

    @state() private _config?: GraphCardConfig;

    @state() private _coordinates?: number[][];

    private _stateHistory?: HassEntity[];

    private _date?: Date;

    private _fetching = false;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: GraphCardConfig): void {
        this._config = {
            hours_to_show: GRAPH_DEFAULT_HOURS,
            graph_mode: "fill",
            display_mode: "standard",
            tap_action: {
                action: "more-info",
            },
            hold_action: {
                action: "more-info",
            },
            double_tap_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    protected updated(changedProperties: PropertyValues) {
        if (!this._config || !this.hass || (this._fetching && !changedProperties.has("_config"))) {
            return;
        }

        if (changedProperties.has("_config")) {
            const oldConfig = changedProperties.get("_config") as GraphCardConfig;
            if (!oldConfig || oldConfig.entity !== this._config!.entity) {
                this._stateHistory = [];
            }

            this._getCoordinates();
        } else if (Date.now() - this._date!.getTime() >= GRAPH_MINUTE) {
            this._getCoordinates();
        }
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    private async _getCoordinates(): Promise<void> {
        this._fetching = true;
        const endTime = new Date();
        const startTime =
            !this._date || !this._stateHistory?.length
                ? new Date(new Date().setHours(endTime.getHours() - this._config!.hours_to_show!))
                : this._date;

        if (this._stateHistory!.length) {
            const inHoursToShow: HassEntity[] = [];
            const outHoursToShow: HassEntity[] = [];
            // Split into inside and outside of "hours to show".
            this._stateHistory!.forEach((entity) =>
                (endTime.getTime() - new Date(entity.last_changed).getTime() <=
                this._config!.hours_to_show! * GRAPH_HOUR
                    ? inHoursToShow
                    : outHoursToShow
                ).push(entity)
            );

            if (outHoursToShow.length) {
                // If we have values that are now outside of "hours to show", re-add the last entry. This could e.g. be
                // the "initial state" from the history backend. Without it, it would look like there is no history data
                // at the start at all in the database = graph would start suddenly instead of on the left side of the card.
                inHoursToShow.push(outHoursToShow[outHoursToShow.length - 1]);
            }
            this._stateHistory = inHoursToShow;
        }

        const stateHistory = await fetchRecent(
            this.hass!,
            this._config!.entity!,
            startTime,
            endTime,
            Boolean(this._stateHistory!.length)
        );

        if (stateHistory.length && stateHistory[0].length) {
            this._stateHistory!.push(...stateHistory[0]);
        }

        this._coordinates =
            coordinates(
                this._stateHistory,
                this._config!.hours_to_show!,
                500,
                this._config!.display_mode === "standard"
                    ? GRAPH_HEIGHT_STANDARD
                    : GRAPH_HEIGHT_COMPACT,
                this._config!.detail!,
                this._config!.limits
            ) || [];

        this._date = endTime;
        this._fetching = false;
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const graphColor = this._config.graph_color;
        const graphMode = this._config.graph_mode;
        const layout = getLayoutFromConfig(this._config);

        let graphHeight: number = GRAPH_HEIGHT_STANDARD + GRAPH_HEIGHT_STANDARD_MARGIN;

        if (this._config.display_mode !== "standard") {
            graphHeight = GRAPH_HEIGHT_COMPACT + GRAPH_HEIGHT_COMPACT_MARGIN;
        }

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const active = isActive(entity);

        const primary = getInfo(
            this._config.primary_info ?? "state",
            name,
            stateDisplay,
            entity,
            this.hass
        );

        const secondary = getInfo(
            this._config.secondary_info ?? "name",
            name,
            stateDisplay,
            entity,
            this.hass
        );

        let iconStyle = {};
        if (graphColor) {
            const iconRgbColor = computeRgbColor(graphColor);
            iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
            iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
        }

        const rtl = computeRTL(this.hass);

        return html`
            <ha-card class=${classMap({ "fill-container": this._config.fill_container ?? false })}>
                <mushroom-card .layout=${layout} ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .layout=${layout}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        <mushroom-shape-icon
                            slot="icon"
                            style=${styleMap(iconStyle)}
                            .disabled=${!active}
                            .icon=${icon}
                        ></mushroom-shape-icon>
                        ${!isAvailable(entity)
                            ? html`
                                  <mushroom-badge-icon
                                      class="unavailable"
                                      slot="badge"
                                      icon="mdi:help"
                                  ></mushroom-badge-icon>
                              `
                            : null}
                        <mushroom-state-info
                            slot="info"
                            .primary=${primary}
                            .secondary=${secondary}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                </mushroom-card>
                <mushroom-graph-base
                    .coordinates=${this._coordinates}
                    .graphColor=${graphColor}
                    .graphMode=${graphMode}
                    .graphHeight=${graphHeight}
                >
                </mushroom-graph-base>
            </ha-card>
        `;
    }

    static get styles(): CSSResultGroup {
        return [super.styles, cardStyle];
    }
}
