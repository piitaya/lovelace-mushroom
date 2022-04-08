import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../../../shared/button";
import {
    isCleaning,
    isReturningHome,
    isStopped,
    isUnavailable,
    supportsCleanSpot,
    supportsLocate,
    supportsPause,
    supportsReturnHome,
    supportsStart,
    supportsStop,
} from "../utils";

interface VacuumCommand {
    icon: string;
    serviceName: string;
    isVisible: (entity: HassEntity) => boolean;
    isDisabled: (entity: HassEntity) => boolean;
}

const VACUUM_COMMANDS: VacuumCommand[] = [
    {
        icon: "play",
        serviceName: "start",
        isVisible: (entity) => supportsStart(entity),
        isDisabled: (entity) => isUnavailable(entity) || isCleaning(entity),
    },
    {
        icon: "pause",
        serviceName: "pause",
        isVisible: (entity) => supportsStart(entity) && supportsPause(entity),
        isDisabled: (entity) => isUnavailable(entity) || !isCleaning(entity),
    },
    {
        icon: "play-pause",
        serviceName: "start_pause",
        isVisible: (entity) => !supportsStart(entity) && supportsPause(entity),
        isDisabled: (entity) => isUnavailable(entity),
    },
    {
        icon: "stop",
        serviceName: "stop",
        isVisible: (entity) => supportsStop(entity),
        isDisabled: (entity) => isUnavailable(entity) || isStopped(entity),
    },
    {
        icon: "target-variant",
        serviceName: "clean_spot",
        isVisible: (entity) => supportsCleanSpot(entity),
        isDisabled: (entity) => isUnavailable(entity),
    },
    {
        icon: "home-map-marker",
        serviceName: "return_to_base",
        isVisible: (entity) => supportsReturnHome(entity),
        isDisabled: (entity) => isUnavailable(entity) || isReturningHome(entity),
    },
    {
        icon: "map-marker",
        serviceName: "locate",
        isVisible: (entity) => supportsLocate(entity),
        isDisabled: (entity) => isUnavailable(entity),
    },
];

@customElement("mushroom-vacuum-buttons-control")
export class VacuumButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property() public fill: boolean = false;

    private _callService(e: MouseEvent, serviceName: string): void {
        e.stopPropagation();
        this.hass.callService("vacuum", serviceName, {
            entity_id: this.entity.entity_id,
        });
    }

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    container: true,
                    fill: this.fill,
                })}
            >
                ${VACUUM_COMMANDS.filter((item) => item.isVisible(this.entity))
                    .slice(0, 4)
                    .map(
                        (item) => html`
                            <mushroom-button
                                .icon="mdi:${item.icon}"
                                .disabled=${item.isDisabled(this.entity)}
                                @click=${(e) => this._callService(e, item.serviceName)}
                            ></mushroom-button>
                        `
                    )}
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                flex-direction: row;
                width: 100%;
            }
            :host *:not(:last-child) {
                margin-right: var(--spacing);
            }
            .container {
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
            }
            .container.fill mushroom-button {
                flex: 1;
            }
        `;
    }
}
