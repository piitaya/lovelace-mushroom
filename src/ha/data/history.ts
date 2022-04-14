import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";

export const fetchRecent = (
    hass: HomeAssistant,
    entityId: string,
    startTime: Date,
    endTime: Date,
    skipInitialState = false,
    significantChangesOnly?: boolean,
    minimalResponse = true,
    noAttributes?: boolean
): Promise<HassEntity[][]> => {
    let url = "history/period";
    if (startTime) {
        url += "/" + startTime.toISOString();
    }
    url += "?filter_entity_id=" + entityId;
    if (endTime) {
        url += "&end_time=" + endTime.toISOString();
    }
    if (skipInitialState) {
        url += "&skip_initial_state";
    }
    if (significantChangesOnly !== undefined) {
        url += `&significant_changes_only=${Number(significantChangesOnly)}`;
    }
    if (minimalResponse) {
        url += "&minimal_response";
    }
    if (noAttributes) {
        url += "&no_attributes";
    }
    return hass.callApi("GET", url);
};
