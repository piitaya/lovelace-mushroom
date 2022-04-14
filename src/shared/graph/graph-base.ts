import { css, CSSResultGroup, html, LitElement, PropertyValues, svg, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { GRAPH_STROKE_WIDTH } from "../../ha/data/graph";
import { computeRgbColor } from "../../utils/colors";
import { getPath } from "../../utils/lovelace/graph/utils";

// FROM : https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/components/hui-graph-base.ts
@customElement("mushroom-graph-base")
export class MushroomGraphBase extends LitElement {
    @property() public coordinates?: any;
    @property() public graphColor?: string;
    @property() public graphMode?: string;
    @property() public graphHeight?: number = 100;

    @state() private _path?: string;

    protected render(): TemplateResult {
        let graphColor = `var(--accent-color)`;
        if (this.graphColor) {
            graphColor = `rgb(${computeRgbColor(this.graphColor)})`;
        }

        return html`
            ${this._path
                ? svg`<svg width="100%" height="100%" viewBox="0 0 500 ${this.graphHeight}">
            <g>
            ${
                this.graphMode === "fill"
                    ? svg`<mask id="fill">
                              <path
                                  class="fill"
                                  fill="white"
                                  d="${this._path} L 500, 100 L 0, 100 z"
                              />
                          </mask>
                          <rect
                              height="100%"
                              width="100%"
                              id="fill-rect"
                              fill="${graphColor}"
                              mask="url(#fill)"
                          ></rect>`
                    : null
            }
              
              <mask id="line">
                <path
                  fill="none"
                  stroke="${graphColor}"
                  stroke-width="${GRAPH_STROKE_WIDTH}"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d=${this._path}
                ></path>
              </mask>
              <rect height="100%" width="100%" id="rect" fill="${graphColor}" mask="url(#line)"></rect>
            </g>
          </svg>`
                : svg`<svg width="100%" height="100%" viewBox="0 0 500 100"></svg>`}
        `;
    }

    public willUpdate(changedProps: PropertyValues) {
        if (!this.coordinates) {
            return;
        }

        if (changedProps.has("coordinates")) {
            this._path = getPath(this.coordinates);
        }
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                width: 100%;
            }
            .fill {
                opacity: 0.1;
            }
        `;
    }
}
