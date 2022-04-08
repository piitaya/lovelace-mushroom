import { CoverEntity } from "../../ha/data/cover";

export function getPosition(entity: CoverEntity) {
    return entity.attributes.current_position != null
        ? Math.round(entity.attributes.current_position)
        : undefined;
}
