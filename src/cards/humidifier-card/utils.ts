import { HumidifierEntity } from "../../ha/data/humidifier";

export function getHumidity(entity: HumidifierEntity) {
    return entity.attributes.humidity != null
        ? Math.round(entity.attributes.humidity)
        : undefined;
}