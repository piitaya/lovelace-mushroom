import { HomeAssistant } from "../../ha/types";
import { ShoppingListItem } from "../../ha/data/shopping-list";
import { Info } from "../../utils/info";

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

export const fetchItems = (hass: HomeAssistant): Promise<ShoppingListItem[]> =>
    hass.callWS({
        type: "shopping_list/items",
    });

export const updateItem = (
    hass: HomeAssistant,
    itemId: string,
    item: {
        name?: string;
        complete?: boolean;
    }
): Promise<ShoppingListItem> =>
    hass.callWS({
        type: "shopping_list/items/update",
        item_id: itemId,
        ...item,
    });

export const clearItems = (hass: HomeAssistant): Promise<void> =>
    hass.callWS({
        type: "shopping_list/items/clear",
    });

export const addItem = (hass: HomeAssistant, name: string): Promise<ShoppingListItem> =>
    hass.callWS({
        type: "shopping_list/items/add",
        name,
    });
