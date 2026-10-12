import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  ClimateEntity,
  computeRTL,
  HomeAssistant,
  isAvailable,
} from "../../../ha";
import "../../../shared/button";
import "../../../shared/button-group";
import { getArbitraryModeIcon } from "../utils";

type ClimateControlAttribute = Extract<
  keyof ClimateEntity["attributes"],
  "preset_mode" | "fan_mode" | "swing_mode"
>;

export const isModesVisible = (
  entity: ClimateEntity,
  attributeName: ClimateControlAttribute,
  modes?: string[]
) =>
  (entity.attributes[`${attributeName}s`] || []).some((mode) =>
    (modes ?? []).includes(mode)
  );

@customElement("mushroom-climate-arbitrary-modes-control")
export class ClimateArbitraryModesControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public entity!: ClimateEntity;

  @property({ attribute: false })
  public attributeName!: ClimateControlAttribute;

  @property({ attribute: false }) public modes!: string[];

  @property() public fill: boolean = false;

  private callService(e: CustomEvent) {
    e.stopPropagation();
    const mode = (e.target! as any).mode as string;
    this.hass.callService("climate", `set_${this.attributeName}`, {
      entity_id: this.entity!.entity_id,
      [this.attributeName]: mode,
    });
  }

  protected render(): TemplateResult {
    const rtl = computeRTL(this.hass);

    const available = this.entity.attributes[`${this.attributeName}s`] ?? [];
    const modes = available.filter((mode) => (this.modes ?? []).includes(mode));
    // .sort(); // We're grabbing the attributes in the order the entity presents them, so it should be fine.

    return html`
      <mushroom-button-group .fill=${this.fill} ?rtl=${rtl}>
        ${modes.map((mode) => this.renderModeButton(mode))}
      </mushroom-button-group>
    `;
  }

  private renderModeButton(mode: string) {
    const iconStyle = {};
    const color = mode === "off" ? "var(--rgb-grey)" : "var(--rgb-green)";
    if (mode === this.entity.attributes[this.attributeName]) {
      iconStyle["--icon-color"] = `rgb(${color})`;
      iconStyle["--bg-color"] = `rgba(${color}, 0.2)`;
    }

    return html`
      <mushroom-button
        style=${styleMap(iconStyle)}
        .mode=${mode}
        .disabled=${!isAvailable(this.entity)}
        @click=${this.callService}
      >
        <ha-icon .icon=${getArbitraryModeIcon(mode)}></ha-icon>
      </mushroom-button>
    `;
  }
}
