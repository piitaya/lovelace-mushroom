import { HomeAssistant } from "custom-card-helpers";
import type { HassEntityAttributeBase, HassEntityBase } from "home-assistant-js-websocket";
import { supportsFeature } from "../../utils/entity";
import { UPDATE_CARD_DEFAULT_STATE_COLOR, UPDATE_CARD_STATE_COLOR } from "./const";

export const UPDATE_SUPPORT_INSTALL = 1;
export const UPDATE_SUPPORT_SPECIFIC_VERSION = 2;
export const UPDATE_SUPPORT_PROGRESS = 4;
export const UPDATE_SUPPORT_BACKUP = 8;
export const UPDATE_SUPPORT_RELEASE_NOTES = 16;

interface UpdateEntityAttributes extends HassEntityAttributeBase {
    auto_update: boolean | null;
    installed_version: string | null;
    in_progress: boolean | number;
    latest_version: string | null;
    release_summary: string | null;
    release_url: string | null;
    skipped_version: string | null;
    title: string | null;
}

export interface UpdateEntity extends HassEntityBase {
    attributes: UpdateEntityAttributes;
}

export const updateUsesProgress = (entity: UpdateEntity): boolean =>
    supportsFeature(entity, UPDATE_SUPPORT_PROGRESS) &&
    typeof entity.attributes.in_progress === "number";

export const updateCanInstall = (entity: UpdateEntity): boolean =>
    entity.state === "on" && supportsFeature(entity, UPDATE_SUPPORT_INSTALL);

export const updateIsInstalling = (entity: UpdateEntity): boolean =>
    updateUsesProgress(entity) || !!entity.attributes.in_progress;

export const updateReleaseNotes = (hass: HomeAssistant, entityId: string) =>
    hass.callWS<string | null>({
        type: "update/release_notes",
        entity_id: entityId,
    });

export function getStateColor(state: string, isInstalling: boolean): string {
    if (isInstalling) {
        return UPDATE_CARD_STATE_COLOR["installing"];
    } else {
        return UPDATE_CARD_STATE_COLOR[state] || UPDATE_CARD_DEFAULT_STATE_COLOR;
    }
}
