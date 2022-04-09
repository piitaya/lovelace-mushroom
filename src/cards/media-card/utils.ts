import { HassEntity } from "home-assistant-js-websocket";
import { supportsFeature } from "../../utils/entity";
import { SUPPORT_VOLUME_SET } from "./const";

export const supportsVolumeSet = (entity: HassEntity) => supportsFeature(entity, SUPPORT_VOLUME_SET);