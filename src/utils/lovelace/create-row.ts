import { HomeAssistant } from "../../ha";
import { computeRowType } from "../../ha/common/entity/compute-row-type";

export interface LovelaceRow extends HTMLElement {
    hass?: HomeAssistant;
    setConfig(config: LovelaceRowConfig): void;
}

export interface LovelaceRowConfig {
    entity: string;
}

export const createRow = (hass: HomeAssistant, entity: string) => {
    const rowType = computeRowType(entity);
    const element = window.document.createElement(rowType) as LovelaceRow;
    element.setConfig({ entity });
    element.hass = hass;
    return element;
};
