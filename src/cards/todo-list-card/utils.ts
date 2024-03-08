import { Info } from "../../utils/info";
import { HomeAssistant, ServiceCallResponse } from "../../ha";
import { TodoItem, TodoItems } from "../../ha/data/todo-list";

export const getStateDisplay = (info: Info = "name", name: string, stateDisplay: string) => {
    switch (info) {
        case "name":
            return name;
        case "state":
            return stateDisplay;
        case "none":
        default:
            return undefined;
    }
};

export const fetchItems = async (hass: HomeAssistant, entityId: string): Promise<TodoItem[]> => {
    const result = await hass.callWS<TodoItems>({
        type: "todo/item/list",
        entity_id: entityId,
    });
    return result.items;
};

export const updateItem = (
    hass: HomeAssistant,
    entity_id: string,
    item: TodoItem
): Promise<ServiceCallResponse> => {
    console.log(entity_id);
    return hass.callService(
        "todo",
        "update_item",
        { item: item.uid, rename: item.summary, status: item.status },
        { entity_id }
    );
};

export const createItem = (
    hass: HomeAssistant,
    entity_id: string,
    summary: string
): Promise<ServiceCallResponse> => {
    return hass.callService(
        "todo",
        "add_item",
        {
            item: summary,
        },
        { entity_id }
    );
};

export const deleteItems = (
    hass: HomeAssistant,
    entity_id: string,
    uids: string[]
): Promise<ServiceCallResponse> => {
    return hass.callService(
        "todo",
        "remove_item",
        {
            item: uids,
        },
        { entity_id }
    );
};
