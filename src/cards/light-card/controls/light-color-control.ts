import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { css, unsafeCSS, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../../shared/slider";

const GRADIENT = [
    [0, "#f00"],
    [0.17, "#ff0"],
    [0.33, "#0f0"],
    [0.5, "#0ff"],
    [0.66, "#00f"],
    [0.83, "#f0f"],
    [1, "#f00"]
];

const CANVAS_WIDTH = 1000;

@customElement("mushroom-light-color-control")
export class LightColorControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    _percent = 0;

    _createRGBCanvas():HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("width", ""+CANVAS_WIDTH);
        canvas.setAttribute("height", "2");
        var ctx = canvas.getContext("2d");
        if (ctx) {
            var grd = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
            GRADIENT.forEach(([stop, color]) => {
                grd.addColorStop(stop as number, color as string);
            });

            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, CANVAS_WIDTH, 2);
        }
        return canvas;
    }

    _percentToRGB(percent:number):number[] {
        const canvas = this._createRGBCanvas();
        var ctx = canvas.getContext("2d");
        if (ctx) {
            let [r,g,b] = ctx.getImageData(percent*CANVAS_WIDTH - 1, 1, 1, 1).data;
            return [r,g,b];
        }
        return [];
    }

    _rgbToPercent(rgb:number):number {
        const canvas = this._createRGBCanvas();
        var ctx = canvas.getContext("2d");
        if (ctx) {
            for(let i = 0; i < CANVAS_WIDTH; i++) {
                let [r,g,b] = ctx.getImageData(i, 1, 1, 1).data;
                if(r === rgb[0] && g === rgb[1] && b === rgb[2]) {
                    return (i/CANVAS_WIDTH) * 100;
                }
            }
        }
        return 0;
    }

    onChange(e: CustomEvent): void {
        const value = Number((e.target as any).value);
        if (isNaN(value)) return;
        this._percent = value;

        const rgb_color = this._percentToRGB(value/100);

        if(rgb_color.length === 3) {
            this.hass.callService("light", "turn_on", {
                entity_id: this.entity.entity_id,
                rgb_color,
            });
        }
    }

    protected render(): TemplateResult {
        const state = this.entity.state;

        const colorPercent = this._percent || this._rgbToPercent(this.entity.attributes.rgb_color);

        return html`
            <mushroom-slider
                .value=${colorPercent}
                .disabled=${state !== "on"}
                .min=${0}
                .max=${100}
                .showIndicator=${true}
                @change=${this.onChange}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        const gradient = GRADIENT.map(([stop, color]) => `${color} ${stop as number*100}%`).join(', ');
        return css`
            mushroom-slider {
                --gradient: -webkit-linear-gradient(
                    left, ${unsafeCSS(gradient)}
                );
            }
        `;
    }
}
