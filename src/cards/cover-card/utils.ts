import { CoverEntity } from "../../ha/data/cover";

export function getPosition(entity: CoverEntity) {
    return entity.attributes.current_position != null
        ? Math.round(entity.attributes.current_position)
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
    return "var(--rgb-state-cover-disabled)";
}
