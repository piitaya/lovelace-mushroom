import { HassEntity } from "home-assistant-js-websocket";

export function computePlantState(entity: HassEntity) {
    const state = entity.state;
    const attributes = entity.attributes;

    if (state === "problem") {
        const words = attributes.problem.split(" ");
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }

        return words.join(" ");
    }
    return null;
}
