import { computeDomain } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { domainIcon } from "./domain-icon";

export function stateIcon(entity: HassEntity): string {
    const domain = computeDomain(entity.entity_id);

    const state = entity.state;

    return domainIcon(domain, entity, state);
}
