import {
  LockEntity,
  LOCK_STATE_LOCKED,
  LOCK_STATE_LOCKING,
  LOCK_STATE_UNLOCKED,
  LOCK_STATE_UNLOCKING,
} from "../../ha";

export function isUnlocked(entity: LockEntity) {
  return entity.state === LOCK_STATE_UNLOCKED;
}

export function isLocked(entity: LockEntity) {
  return entity.state === LOCK_STATE_LOCKED;
}

export function isActionPending(entity: LockEntity) {
  switch (entity.state) {
    case LOCK_STATE_LOCKING:
    case LOCK_STATE_UNLOCKING:
      return true;
    default:
      return false;
  }
}
