import { ActionHandlerEvent, handleAction, hasAction, HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { computeStateDisplay } from "../../../ha/common/entity/compute-state-display";
import { isActive } from "../../../ha/data/entity";
import { computeRgbColor } from "../../../utils/colors";
import { actionHandler } from "../../../utils/directives/action-handler-directive";
import { stateIcon } from "../../../utils/icons/state-icon";
import { getInfo } from "../../../utils/info";
import {
    computeSceneComponentName,
    computeSceneEditorComponentName,
} from "../../../utils/lovelace/scene/scene-element";
import { LovelaceScene, SceneSceneConfig } from "../../../utils/lovelace/scene/types";
import { LovelaceSceneEditor } from "../../../utils/lovelace/types";

@customElement(computeSceneComponentName("scene"))
export class SceneItem extends LitElement implements LovelaceScene {
    public static async getConfigElement(): Promise<LovelaceSceneEditor> {
        await import("./scene-item-editor");
        return document.createElement(
            computeSceneEditorComponentName("scene")
        ) as LovelaceSceneEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<SceneSceneConfig> {
        const entities = Object.keys(hass.states);
        return {
            type: `scene`,
            entity: entities[0],
        };
    }

    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: SceneSceneConfig;

    public setConfig(config: SceneSceneConfig): void {
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

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const active = isActive(entity);

        const iconStyle = {};
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--color"] = `rgb(${iconRgbColor})`;
        }

        return html`
            <mushroom-scene @action=${this._handleAction}>
                <ha-icon
                    .icon=${icon}
                    style=${styleMap(iconStyle)}
                    class=${classMap({ active })}
                ></ha-icon>
                <span>${name}</span>
            </mushroom-scene>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-scene {
                cursor: pointer;
            }
            ha-icon.active {
                color: var(--color);
            }
        `;
    }
}
