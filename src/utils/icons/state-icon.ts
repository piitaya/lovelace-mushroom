import { computeDomain } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { domainIcon } from "./domain-icon";

export function stateIcon(entity: HassEntity): string {
    if (entity.attributes.icon) {
        return entity.attributes.icon;
    }

    const domain = computeDomain(entity.entity_id);

    const state = entity.state;

    return domainIcon(domain, entity, state);
}
