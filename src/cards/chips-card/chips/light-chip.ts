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
import { isActive } from "../../../ha/data/entity";
import { LightEntity } from "../../../ha/data/light";
import { actionHandler } from "../../../utils/directives/action-handler-directive";
import { stateIcon } from "../../../utils/icons/state-icon";
import { getInfo } from "../../../utils/info";
import {
    computeChipComponentName,
    computeChipEditorComponentName,
} from "../../../utils/lovelace/chip/chip-element";
import { LightChipConfig, LovelaceChip } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { getRGBColor, isColorSuperLight } from "../../light-card/utils";

@customElement(computeChipComponentName("light"))
export class LightChip extends LitElement implements LovelaceChip {
    public static async getConfigElement(): Promise<LovelaceChipEditor> {
        await import("./light-chip-editor");
        return document.createElement(
            computeChipEditorComponentName("light")
        ) as LovelaceChipEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<LightChipConfig> {
        const entities = Object.keys(hass.states);
        const lights = entities.filter((e) => e.split(".")[0] === "light");
        return {
            type: `light`,
            entity: lights[0],
        };
    }

    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: LightChipConfig;

    public setConfig(config: LightChipConfig): void {
        this._config = {
            tap_action: {
                action: "toggle",
            },
            hold_action: {
                action: "more-info",
            },
            double_tap_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id] as LightEntity;

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const active = isActive(entity);

        const lightRgbColor = getRGBColor(entity);
        const iconStyle = {};
        if (lightRgbColor && this._config?.use_light_color) {
            const color = lightRgbColor.join(",");
            iconStyle["--color"] = `rgb(${color})`;
            if (isColorSuperLight(lightRgbColor)) {
                iconStyle["--color"] = `rgba(var(--rgb-primary-text-color), 0.2)`;
            }
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
                    class=${classMap({ active })}
                ></ha-icon>
                ${content ? html`<span>${content}</span>` : null}
            </mushroom-chip>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --color: rgb(var(--rgb-state-light));
            }
            mushroom-chip {
                cursor: pointer;
            }
            ha-icon.active {
                color: var(--color);
            }
        `;
    }
}
