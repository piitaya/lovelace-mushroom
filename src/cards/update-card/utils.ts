import { HomeAssistant, LocalizeFunc } from "custom-card-helpers";
import type {
    HassEntity,
    HassEntityAttributeBase,
    HassEntityBase,
} from "home-assistant-js-websocket";
import { supportsFeature } from "../../utils/entity";

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

export const computeUpdateStateDisplay = (
    localize: LocalizeFunc,
    stateObj: HassEntity,
    state?: string | undefined
): string => {
    const compareState = state !== undefined ? state : stateObj.state;
    return compareState === "on"
        ? updateIsInstalling(stateObj as UpdateEntity)
            ? supportsFeature(stateObj, UPDATE_SUPPORT_PROGRESS)
                ? localize("ui.card.update.installing_with_progress", {
                      progress: stateObj.attributes.in_progress,
                  })
                : localize("ui.card.update.installing")
            : stateObj.attributes.latest_version
        : stateObj.attributes.skipped_version === stateObj.attributes.latest_version
        ? stateObj.attributes.latest_version ?? localize("state.default.unavailable")
        : localize("ui.card.update.up_to_date");
};
