import { ActionHandlerEvent, handleAction, HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { computeStateDisplay } from "../../../ha/common/entity/compute-state-display";
import { isActive } from "../../../ha/data/entity";
import { computeRgbColor } from "../../../utils/colors";
import { stateIcon } from "../../../utils/icons/state-icon";
import { SceneElement, ScriptConfig } from "../scene-editor-config";
import { computeComponentName, computeEditorComponentName, LovelaceItemEditor } from "../utils";

@customElement(computeComponentName("script"))
export class ScriptItem extends LitElement implements SceneElement {
    public static async getConfigElement(): Promise<LovelaceItemEditor> {
        await import("./script-item-editor");
        return document.createElement(
            computeEditorComponentName("script")
        ) as LovelaceItemEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<ScriptConfig> {
        const entities = Object.keys(hass.states);
        const script = entities.filter((e) => e.split(".")[0] === "script");
        return {
            type: `script`,
            entity: script[0],
        };
    }

    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: ScriptConfig;

    public setConfig(config: ScriptConfig): void {
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
            <mushroom-script
                @action=${this._handleAction}
            >
                <ha-icon
                    .icon=${icon}
                    style=${styleMap(iconStyle)}
                    class=${classMap({ active })}
                ></ha-icon>
                <span>${name}</span>
            </mushroom-script>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-script {
                cursor: pointer;
            }
            ha-icon.active {
                color: var(--color);
            }
        `;
    }
}
