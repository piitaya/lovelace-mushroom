import { HomeAssistant } from "../../ha";
import { computeRowType } from "../../ha/common/entity/compute-row-type";

export interface LovelaceRow extends HTMLElement {
    hass?: HomeAssistant;
    setConfig(config: LovelaceRowConfig): void;
}

export interface LovelaceRowConfig {
    entity: string;
    error?: string;
}

export const createRow = (hass: HomeAssistant, entity: string) => {
    try {
        const rowType = computeRowType(entity);
        const row = window.document.createElement(rowType) as LovelaceRow;
        row.setConfig({ entity });
        row.hass = hass;
        return row;
    } catch (err) {
        const error = window.document.createElement("hui-error-card") as LovelaceRow;
        error.setConfig({ error: "Error! Can't create row from " + entity + ".", entity });
        return error;
    }
};
