import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import {
    ALARM_CONTROL_PANEL_CARD_DEFAULT_STATE_COLOR,
    ALARM_CONTROL_PANEL_CARD_DEFAULT_STATE_ICON,
    ALARM_CONTROL_PANEL_CARD_STATE_COLOR,
    ALARM_CONTROL_PANEL_CARD_STATE_ICON,
    ALARM_CONTROL_PANEL_CARD_STATE_SERVICE,
} from "./const";

export function getStateColor(state: string): string {
    return (
        ALARM_CONTROL_PANEL_CARD_STATE_COLOR[state.split("_")[0]] ??
        ALARM_CONTROL_PANEL_CARD_DEFAULT_STATE_COLOR
    );
}

export function getStateIcon(state: string): string {
    return (
        ALARM_CONTROL_PANEL_CARD_STATE_ICON[state] ||
        ALARM_CONTROL_PANEL_CARD_DEFAULT_STATE_ICON
    );
}

export function getStateService(state: string): string | undefined {
    return ALARM_CONTROL_PANEL_CARD_STATE_SERVICE[state];
}

export function isActionsAvailable(entity: HassEntity) {
    return !["pending", "unavailable"].includes(entity.state);
}

export function isDisarmed(entity: HassEntity) {
    return entity.state === "disarmed";
}

export function hasGroupInconsistentState(
    entity: HassEntity,
    hass: HomeAssistant
) {
    const isGroup = Boolean(entity.entity_id.startsWith("group."));
    if (!isGroup) return false;

    const allEntityIds: string[] =
        hass.states[entity.entity_id].attributes.entity_id;
    const firstEntity: string = allEntityIds[0];

    return allEntityIds.some(
        (entityId) =>
            hass.states[entityId].state !== hass.states[firstEntity].state
    );
}

export function getGroupMainEntity(
    entity: HassEntity,
    hass: HomeAssistant
): HassEntity {
    const isGroup = Boolean(entity.entity_id.startsWith("group."));
    if (!isGroup) return entity;

    const allEntityIds: string[] =
        hass.states[entity.entity_id].attributes.entity_id;
    return hass.states[allEntityIds[0]];
}
