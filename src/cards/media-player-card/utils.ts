import { HassEntity } from "home-assistant-js-websocket";
import { supportsFeature } from "../../ha/common/entity/supports-feature";
import { MEDIA_PLAYER_SUPPORT_VOLUME_SET } from "../../ha/data/media-player";

export const supportsVolumeSet = (entity: HassEntity) => supportsFeature(entity, MEDIA_PLAYER_SUPPORT_VOLUME_SET);