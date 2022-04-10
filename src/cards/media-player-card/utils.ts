import { computeStateDisplay, HomeAssistant, stateIcon } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { supportsFeature } from "../../ha/common/entity/supports-feature";
import {
    MediaPlayerEntity,
    MEDIA_PLAYER_STATE_OFF,
    MEDIA_PLAYER_SUPPORT_NEXT_TRACK,
    MEDIA_PLAYER_SUPPORT_PAUSE,
    MEDIA_PLAYER_SUPPORT_PLAY,
    MEDIA_PLAYER_SUPPORT_PREVIOUS_TRACK,
    MEDIA_PLAYER_SUPPORT_VOLUME_SET,
} from "../../ha/data/media-player";
import { MediaPlayerCardConfig } from "./media-player-card-config";

export function callService(
    e: MouseEvent,
    hass: HomeAssistant,
    entity: HassEntity,
    serviceName: string
): void {
    e.stopPropagation();
    hass.callService("media_player", serviceName, {
        entity_id: entity.entity_id
    });
}

export function getCardName(config: MediaPlayerCardConfig, entity: MediaPlayerEntity): string {
    let name = config.name || entity.attributes.friendly_name || "";
    if (entity.state != MEDIA_PLAYER_STATE_OFF) {
        if (entity.attributes.media_title) {
            name = entity.attributes.media_title;
        }
    }
    return name;
}

export function getStateDisplay(entity: MediaPlayerEntity, hass: HomeAssistant): string {
    let state = computeStateDisplay(hass.localize, entity, hass.locale);
    if (entity.state != MEDIA_PLAYER_STATE_OFF) {
        if (entity.attributes.media_album_name) {
            state = entity.attributes.media_album_name;
        }
        if (entity.attributes.media_artist) {
            state = entity.attributes.media_artist;
        }
        if (entity.attributes.media_series_title) {
            state = entity.attributes.media_series_title;
            if (entity.attributes.media_season && entity.attributes.media_episode) {
                state +=
                    " S" + entity.attributes.media_season + "E" + entity.attributes.media_episode;
            }
        }
    }
    return state;
}

export function getVolumeLevel(entity: MediaPlayerEntity) {
    return entity.attributes.volume_level != null
        ? entity.attributes.volume_level * 100
        : undefined;
}

export function computeIcon(config: MediaPlayerCardConfig, entity: MediaPlayerEntity): string {
    var icon = config.icon || stateIcon(entity);

    if (!entity.attributes.app_name) return icon;

    var app = entity.attributes.app_name.toLowerCase();
    switch (app) {
        case "spotify":
            return "mdi:spotify";
        case "google podcasts":
            return "mdi:google-podcast";
        case "plex":
            return "mdi:plex";
        case "soundcloud":
            return "mdi:soundcloud";
        case "youtube":
            return "mdi:youtube";
        case "oto music":
            return "mdi:music-circle";
        case "netflix":
            return "mdi:netflix";
        default:
            return icon;
    }
}

export const supportsPrevious = (entity: HassEntity) =>
    supportsFeature(entity, MEDIA_PLAYER_SUPPORT_PREVIOUS_TRACK);
export const supportsPlay = (entity: HassEntity) =>
    supportsFeature(entity, MEDIA_PLAYER_SUPPORT_PLAY);
export const supportsPause = (entity: HassEntity) =>
    supportsFeature(entity, MEDIA_PLAYER_SUPPORT_PAUSE);
export const supportsNext = (entity: HassEntity) =>
    supportsFeature(entity, MEDIA_PLAYER_SUPPORT_NEXT_TRACK);
export const supportsVolumeSet = (entity: HassEntity) =>
    supportsFeature(entity, MEDIA_PLAYER_SUPPORT_VOLUME_SET);
