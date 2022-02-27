import { computeDomain } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { domainIcon } from "./domain-icon";

export function stateIcon(entity: HassEntity): string {
 ​   ​const state = entity.state;
    
    if​ ​(​state​.​attributes​.​icon​)​ ​{ 
 ​       return​ ​state​.​attributes​.​icon​; 
 ​  ​ }

    const domain = computeDomain(entity.entity_id);
 
    return domainIcon(domain, entity, state);
}
