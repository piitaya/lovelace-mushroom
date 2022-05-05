import {
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { computeStateDisplay } from "../../../ha/common/entity/compute-state-display";
import { computeRgbColor } from "../../../utils/colors";
import { actionHandler } from "../../../utils/directives/action-handler-directive";
import { animation } from "../../../utils/entity-styles";
import { stateIcon } from "../../../utils/icons/state-icon";
import { getInfo } from "../../../utils/info";
import {
    computeChipComponentName,
    computeChipEditorComponentName,
} from "../../../utils/lovelace/chip/chip-element";
import {
    AlarmControlPanelChipConfig,
    EntityChipConfig,
    LovelaceChip,
} from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { ALARM_CONTROl_PANEL_ENTITY_DOMAINS } from "../../alarm-control-panel-card/const";
import { getStateColor, shouldPulse } from "../../alarm-control-panel-card/utils";

@customElement(computeChipComponentName("alarm-control-panel"))
export class AlarmControlPanelChip extends LitElement implements LovelaceChip {
    public static async getConfigElement(): Promise<LovelaceChipEditor> {
        await import("./alarm-control-panel-chip-editor");
        return document.createElement(
            computeChipEditorComponentName("alarm-control-panel")
        ) as LovelaceChipEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<AlarmControlPanelChipConfig> {
        const entities = Object.keys(hass.states);
        const panels = entities.filter((e) =>
            ALARM_CONTROl_PANEL_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
        return {
            type: `alarm-control-panel`,
            entity: panels[0],
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

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const iconColor = getStateColor(entity.state);
        const iconPulse = shouldPulse(entity.state);

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

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

        const rtl = computeRTL(this.hass);

        return html`
            <mushroom-chip
                ?rtl=${rtl}
                @action=${this._handleAction}
                .actionHandler=${actionHandler({
                    hasHold: hasAction(this._config.hold_action),
                    hasDoubleClick: hasAction(this._config.double_tap_action),
                })}
            >
                <ha-icon
                    .icon=${icon}
                    style=${styleMap(iconStyle)}
                    class=${classMap({ pulse: iconPulse })}
                ></ha-icon>
                ${content ? html`<span>${content}</span>` : null}
            </mushroom-chip>
        `;
    }

    // Animation cannot be defined on chip element, key-frames cannot be scoped to a slotted element: https://github.com/WICG/webcomponents/issues/748
    static get styles(): CSSResultGroup {
        return css`
            mushroom-chip {
                cursor: pointer;
            }
            ha-icon {
                color: var(--color);
            }
            ha-icon.pulse {
                animation: 1s ease 0s infinite normal none running pulse;
            }
            ${animation.pulse}
        `;
    }
}
