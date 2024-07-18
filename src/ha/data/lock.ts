import {
  HassEntityAttributeBase,
  HassEntityBase,
} from "home-assistant-js-websocket";

interface LockEntityAttributes extends HassEntityAttributeBase {
  changed_by?: string;
  code_format?: string;
  code?: string;
  is_locked?: boolean;
  is_locking?: boolean;
  is_unlocking?: boolean;
}

export type LockCommand =
  | typeof LOCK_SERVICE_LOCK
  | typeof LOCK_SERVICE_OPEN
  | typeof LOCK_SERVICE_UNLOCK;

export type LOCK_STATES =
  | typeof LOCK_STATE_JAMMED
  | typeof LOCK_STATE_LOCKED
  | typeof LOCK_STATE_LOCKING
  | typeof LOCK_STATE_UNLOCKED
  | typeof LOCK_STATE_UNLOCKING;

export interface LockEntity extends HassEntityBase {
  attributes: LockEntityAttributes;
  state: LOCK_STATES | "unavailable" | "unknown";
}

export const LOCK_STATE_JAMMED = "jammed";
export const LOCK_STATE_LOCKED = "locked";
export const LOCK_STATE_LOCKING = "locking";
export const LOCK_STATE_UNLOCKED = "unlocked";
export const LOCK_STATE_UNLOCKING = "unlocking";

export const LOCK_SUPPORT_OPEN = 1;

export const LOCK_SERVICE_LOCK = "lock";
export const LOCK_SERVICE_OPEN = "open";
export const LOCK_SERVICE_UNLOCK = "unlock";
