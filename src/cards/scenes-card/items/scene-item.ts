import { ActionHandlerEvent, handleAction, HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { computeRgbColor } from "../../../utils/colors";
import { stateIcon } from "../../../utils/icons/state-icon";
import { LovelaceItemEditor, SceneConfig, SceneElement } from "../scene-editor-config";
import { computeComponentName, computeEditorComponentName } from "../utils";

@customElement(computeComponentName("scene"))
export class SceneItem extends LitElement implements SceneElement {
    public static async getConfigElement(): Promise<LovelaceItemEditor> {
        await import("./scene-item-editor");
        return document.createElement(computeEditorComponentName("scene")) as LovelaceItemEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<SceneConfig> {
        const entities = Object.keys(hass.states);
        const scene = entities.filter((e) => e.split(".")[0] === "scene");
        return {
            type: `scene`,
            entity: scene[0],
        };
    }

    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: SceneConfig;

    public setConfig(config: SceneConfig): void {
        this._config = config;
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];
        if (!entity) return html``;

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const iconColor = this._config.icon_color;
        const backgroundColor = this._config.background_color;

        const iconStyle = {};
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--primary-text-color"] = `rgb(${iconRgbColor})`;
        }

        if (backgroundColor) {
            const bgRgbColor = computeRgbColor(backgroundColor);
            iconStyle["--shape-color"] = `rgba(${bgRgbColor}, 0.1)`;
        }

        const haCardStyle = {
            "--box-shadow": `0px 2px 4px 0px rgba(0, 0, 0, 0.8);`
        };

        if(!(this.hass.themes as any).darkMode) {
            haCardStyle["--box-shadow"] = `0px 2px 4px 0px rgba(0, 0, 0, 0.2);`;
        }

        return html`
            <mushroom-scene @action=${this._handleAction}>
                <ha-card style=${styleMap(haCardStyle)}>
                    <div class="container">
                        <mushroom-shape-icon
                            slot="icon"
                            style=${styleMap(iconStyle)}
                            .icon=${icon}
                        ></mushroom-shape-icon>
                        <span class="name">${name}</span>
                    </div>
                </ha-card>
            </mushroom-scene>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            ha-card {
                cursor: pointer;
                border-radius: 50px;
                place-self: center;
                width: 52px;
                height: 84px;
                box-shadow: var(--box-shadow);
                --box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.8);
                box-sizing: border-box;
                text-align: center;
                padding: 5px;
            }
            div.container {
                display: grid;
                grid-template:
                    "i" 1fr
                    "n" 1fr / min-content;
                row-gap: 0px;
                justify-items: center;
            }
            span.name {
                font-size: 9.5px;
                font-weight: bold;
                padding-bottom: 7px;
                width: 33px;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                grid-area: n / n / n / n;
                max-width: 100%;
                place-self: center;
            }
            mushroom-shape-icon {
                grid-area: i / i / i / i;
                max-width: 100%;
                place-self: center;
                overflow: hidden;
                justify-content: center;
                align-items: center;
                position: relative;
                display: flex;
            }
            mushroom-scene {
                cursor: pointer;
            }
            ha-icon.active {
                color: var(--color);
            }
        `;
    }
}
