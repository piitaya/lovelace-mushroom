import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { HassEntity } from "home-assistant-js-websocket";
import { Layout } from "../utils/layout";

@customElement("mushroom-status-bar")
export class StatusBar extends LitElement {
    @property() public layout: Layout = "default";

    @property() public entity: HassEntity | undefined;

    protected render(): TemplateResult {
        const limits = this.entity?.attributes?.limits || {
            min_temperature: 6,
            max_temperature: 30,
            min_brightness: 2500,
            max_brightness: 30000,
            min_moisture: 15,
            max_moisture: 60,
            min_conductivity: 500,
            max_conductivity: 3000,
        };

        console.log(limits);
        const attribute = (icon, attr, min, max) => {
            const value = this.entity?.attributes[attr];
            const available = value !== "unavailable";
            const pct = 100 * Math.max(0, Math.min(1, (value - min) / (max - min)));

            return html` <div class="attribute tooltip">
                <ha-icon .icon="${icon}"></ha-icon>
                <div class="meter red">
                    <span
                        class="${available
                            ? value < min || value > max
                                ? "bad"
                                : "good"
                            : "unavailable"}"
                        style="width: 100%;"
                    ></span>
                </div>
                <div class="meter green">
                    <span
                        class="${available ? (value > max ? "bad" : "good") : "unavailable"}"
                        style="width:${available ? pct : "0"}%;"
                    ></span>
                </div>
                <div class="meter red">
                    <span
                        class="bad"
                        style="width:${available ? (value > max ? 100 : 0) : "0"}%;"
                    ></span>
                </div>
            </div>`;
        };

        return html`
            <div>
                <div class="sensors">
                    ${attribute(
                        "mdi:thermometer",
                        "temperature",
                        limits["min_temperature"],
                        limits["max_temperature"]
                    )}
                    ${attribute(
                        "mdi:white-balance-sunny",
                        "brightness",
                        limits["min_brightness"],
                        limits["max_brightness"]
                    )}
                </div>
                <div class="sensors">
                    ${attribute(
                        "mdi:water-percent",
                        "moisture",
                        limits["min_moisture"],
                        limits["max_moisture"]
                    )}
                    ${attribute(
                        "mdi:leaf",
                        "conductivity",
                        limits["min_conductivity"],
                        limits["max_conductivity"]
                    )}
                </div>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            .sensors {
                white-space: nowrap;
                padding-top: 10px;
            }
            .attribute {
                display: inline-block;
                width: 50%;
                white-space: normal;
            }
            .meter {
                height: 8px;
                background-color: #f1f1f1;
                border-radius: 2px;
                display: inline-grid;
                overflow: hidden;
            }
            .meter.red {
                width: 10%;
            }
            .meter.green {
                width: 45%;
            }
            .meter > span {
                grid-row: 1;
                grid-column: 1;
                height: 100%;
            }
            .meter > .good {
                background-color: rgba(43, 194, 83, 1);
            }
            .meter > .bad {
                background-color: rgba(240, 163, 163);
            }
            .meter > .unavailable {
                background-color: rgba(158, 158, 158, 1);
            }
        `;
    }
}
