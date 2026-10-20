import {
  COVER_SUPPORT_CLOSE,
  COVER_SUPPORT_OPEN,
  COVER_SUPPORT_SET_POSITION,
  COVER_SUPPORT_SET_TILT_POSITION,
  COVER_SUPPORT_STOP,
  CoverEntity,
  supportsFeature,
} from "../../ha";

export function supportsButtonsControl(entity: CoverEntity): boolean {
  return (
    supportsFeature(entity, COVER_SUPPORT_OPEN) ||
    supportsFeature(entity, COVER_SUPPORT_CLOSE) ||
    supportsFeature(entity, COVER_SUPPORT_STOP)
  );
}

export function supportsPositionControl(entity: CoverEntity): boolean {
  return supportsFeature(entity, COVER_SUPPORT_SET_POSITION);
}

export function supportsTiltPositionControl(entity: CoverEntity): boolean {
  return supportsFeature(entity, COVER_SUPPORT_SET_TILT_POSITION);
}

export function getPosition(entity: CoverEntity) {
  return entity.attributes.current_position != null
    ? Math.round(entity.attributes.current_position)
    : undefined;
}

export function getTiltPosition(entity: CoverEntity) {
  return entity.attributes.current_tilt_position != null
    ? Math.round(entity.attributes.current_tilt_position)
    : undefined;
}

export function getStateColor(entity: CoverEntity) {
  const state = entity.state;
  if (state === "open" || state === "opening") {
    return "var(--rgb-state-cover-open)";
  }
  if (state === "closed" || state === "closing") {
    return "var(--rgb-state-cover-closed)";
  }
  return "var(--rgb-disabled)";
}
