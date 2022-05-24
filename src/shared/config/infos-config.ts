import { enums, Infer, object, optional } from "superstruct";
import { ICON_INFOS, INFOS } from "../../utils/info";

export const infosSharedConfigStruct = object({
    primary_info: optional(enums(INFOS)),
    secondary_info: optional(enums(INFOS)),
    icon_info: optional(enums(ICON_INFOS)),
});

export type InfosSharedConfig = Infer<typeof infosSharedConfigStruct>;
