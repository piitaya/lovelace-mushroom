import { HassEntity } from "home-assistant-js-websocket";
import { computeDomain } from "../../ha";
import { domainIcon } from "./domain-icon";

export function stateIcon(stateObj: HassEntity): string {
    if (stateObj.attributes.icon) {
        return stateObj.attributes.icon;
    }

    const domain = computeDomain(stateObj.entity_id);

    const state = stateObj.state;

    return domainIcon(domain, stateObj, state);
}
