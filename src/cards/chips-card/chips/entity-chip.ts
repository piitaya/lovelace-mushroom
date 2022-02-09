import {
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    stateIcon,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { LovelaceChip } from ".";
import { computeRgbColor } from "../../../utils/colors";
import { actionHandler } from "../../../utils/directives/action-handler-directive";
import { isActive } from "../../../utils/entity";
import { getInfo } from "../../../utils/info";
import { EntityChipConfig } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { computeChipComponentName, computeChipEditorComponentName } from "../utils";
import "./entity-chip-editor";

@customElement(computeChipComponentName("entity"))
export class EntityChip extends LitElement implements LovelaceChip {
    public static async getConfigElement(): Promise<LovelaceChipEditor> {
        return document.createElement(
            computeChipEditorComponentName("entity")
        ) as LovelaceChipEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<EntityChipConfig> {
        const entities = Object.keys(hass.states);
        return {
            type: `entity`,
            entity: entities[0],
        };
    }

    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: EntityChipConfig;

    public setConfig(config: EntityChipConfig): void {
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

        const name = this._config.name ?? entity.attributes.friendly_name ?? "";
        const icon = this._config.icon ?? stateIcon(entity);
        const iconColor = this._config.icon_color;

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const active = isActive(entity);

        const iconStyle = {};
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--color"] = `rgb(${iconRgbColor})`;
        }

        const content = getInfo(
            this._config.content_info ?? "state",
            name,
            stateDisplay,
            entity,
            this.hass
        );

        return html`
            <mushroom-chip
                @action=${this._handleAction}
                .actionHandler=${actionHandler({
                    hasHold: hasAction(this._config.hold_action),
                })}
            >
                <ha-icon
                    .icon=${icon}
                    style=${styleMap(iconStyle)}
                    class=${classMap({ active })}
                ></ha-icon>
                <span>${content}</span>
            </mushroom-chip>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            mushroom-chip {
                cursor: pointer;
            }
            ha-icon.active {
                color: var(--color);
            }
        `;
    }
}
