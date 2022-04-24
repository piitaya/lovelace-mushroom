import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, customElement } from "lit/decorators.js";
import { HassEntity } from "home-assistant-js-websocket";
import { Layout } from "../utils/layout";

@customElement("mushroom-status-bar")
export class StatusBar extends LitElement {
    @property() public layout: Layout = "default";
    @property() public entity: HassEntity | undefined;
    @property() public icon: string = "";
    @property() public attr: string = "";
    @property() public min: number = 0;
    @property() public max: number = 100;

    protected render(): TemplateResult {
        const value = this.entity?.attributes[this.attr];
        const available = value !== "unavailable";
        const pct = 100 * Math.max(0, Math.min(1, (value - this.min) / (this.max - this.min)));

        return html` <div class="attribute">
            <ha-icon .icon="${this.icon}"></ha-icon>
            <div>
                <div class="meter red">
                    <span
                        class="${available
                            ? value < this.min || value > this.max
                                ? "bad"
                                : "good"
                            : "unavailable"}"
                        style="width: 100%;"
                    ></span>
                </div>
                <div class="meter green">
                    <span
                        class="${available ? (value > this.max ? "bad" : "good") : "unavailable"}"
                        style="width:${available ? pct : "0"}%;"
                    ></span>
                </div>
                <div class="meter red">
                    <span
                        class="bad"
                        style="width:${available ? (value > this.max ? 100 : 0) : "0"}%;"
                    ></span>
                </div>
            </div>
        </div>`;
    }

    static get styles(): CSSResultGroup {
        return css`
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
                width: 50%;
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
