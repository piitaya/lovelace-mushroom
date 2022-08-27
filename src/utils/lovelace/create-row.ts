import { HomeAssistant, LovelaceRow } from "../../ha";
import { computeRowType } from "../../ha/common/entity/compute-row-type";

export const createRow = (hass: HomeAssistant, entity: string) => {
    const rowType = computeRowType(entity);
    const element = window.document.createElement(rowType) as LovelaceRow;
    element.setConfig({ entity });
    element.hass = hass;
    return element;
};
