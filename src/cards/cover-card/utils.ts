import { CoverEntity } from "../../ha";
import { CoverCardControl } from "./cover-card-config";

/**
 * Pick the control to display.
 *
 * The current control is kept as long as it is still enabled, so it does not
 * reset on every rerender. Otherwise the configured default control is used,
 * falling back to the first enabled control when it is not enabled.
 */
export function computeActiveControl(
  controls: CoverCardControl[],
  currentControl: CoverCardControl | undefined,
  defaultControl: CoverCardControl | undefined
): CoverCardControl | undefined {
  if (currentControl && controls.includes(currentControl)) {
    return currentControl;
  }
  if (defaultControl && controls.includes(defaultControl)) {
    return defaultControl;
  }
  return controls[0];
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
