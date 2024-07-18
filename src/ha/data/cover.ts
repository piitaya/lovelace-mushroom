import {
  HassEntityAttributeBase,
  HassEntityBase,
} from "home-assistant-js-websocket";
import { supportsFeature } from "../common/entity/supports-feature";

export const COVER_SUPPORT_OPEN = 1;
export const COVER_SUPPORT_CLOSE = 2;
export const COVER_SUPPORT_SET_POSITION = 4;
export const COVER_SUPPORT_STOP = 8;
export const COVER_SUPPORT_OPEN_TILT = 16;
export const COVER_SUPPORT_CLOSE_TILT = 32;
export const COVER_SUPPORT_STOP_TILT = 64;
export const COVER_SUPPORT_SET_TILT_POSITION = 128;

export function isFullyOpen(stateObj: CoverEntity) {
  if (stateObj.attributes.current_position !== undefined) {
    return stateObj.attributes.current_position === 100;
  }
  return stateObj.state === "open";
}

export function isFullyClosed(stateObj: CoverEntity) {
  if (stateObj.attributes.current_position !== undefined) {
    return stateObj.attributes.current_position === 0;
  }
  return stateObj.state === "closed";
}

export function isFullyOpenTilt(stateObj: CoverEntity) {
  return stateObj.attributes.current_tilt_position === 100;
}

export function isFullyClosedTilt(stateObj: CoverEntity) {
  return stateObj.attributes.current_tilt_position === 0;
}

export function isOpening(stateObj: CoverEntity) {
  return stateObj.state === "opening";
}

export function isClosing(stateObj: CoverEntity) {
  return stateObj.state === "closing";
}

export function isTiltOnly(stateObj: CoverEntity) {
  const supportsCover =
    supportsFeature(stateObj, COVER_SUPPORT_OPEN) ||
    supportsFeature(stateObj, COVER_SUPPORT_CLOSE) ||
    supportsFeature(stateObj, COVER_SUPPORT_STOP);
  const supportsTilt =
    supportsFeature(stateObj, COVER_SUPPORT_OPEN_TILT) ||
    supportsFeature(stateObj, COVER_SUPPORT_CLOSE_TILT) ||
    supportsFeature(stateObj, COVER_SUPPORT_STOP_TILT);
  return supportsTilt && !supportsCover;
}

interface CoverEntityAttributes extends HassEntityAttributeBase {
  current_position: number;
  current_tilt_position: number;
}

export interface CoverEntity extends HassEntityBase {
  attributes: CoverEntityAttributes;
}
