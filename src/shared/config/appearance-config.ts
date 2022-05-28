import { HassEntity } from "home-assistant-js-websocket";
import { boolean, enums, Infer, object, optional } from "superstruct";
import { getEntityPicture } from "../../ha/data/entity";
import { IconInfo, ICON_INFOS, Info, INFOS } from "../../utils/info";
import { Layout, layoutStruct } from "../../utils/layout";

export const appearanceSharedConfigStruct = object({
    layout: optional(layoutStruct),
    fill_container: optional(boolean()),
    primary_info: optional(enums(INFOS)),
    secondary_info: optional(enums(INFOS)),
    icon_info: optional(enums(ICON_INFOS)),
});

export type AppearanceSharedConfig = Infer<typeof appearanceSharedConfigStruct>;

export type Appearance = {
    layout: Layout;
    fill_container: boolean;
    primary_info: Info;
    secondary_info: Info;
    icon_info: IconInfo;
};
