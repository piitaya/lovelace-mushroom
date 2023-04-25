import { STATES_OFF } from "../../../../common/const";
import { HomeAssistant, ServiceCallResponse } from "../../../../types";
import { turnOnOffEntity } from "./turn-on-off-entity";

export const toggleEntity = (
    hass: HomeAssistant,
    entityId: string
): Promise<ServiceCallResponse> => {
    const stateObj = hass.states[entityId];
    const turnOn = stateObj && STATES_OFF.includes(stateObj.state);
    return turnOnOffEntity(hass, entityId, turnOn);
};
