import { enums, Infer, object, optional } from "superstruct";
import { INFOS } from "../../utils/info";

export const infosSharedConfigStruct = object({
    primary_info: optional(enums(INFOS)),
    secondary_info: optional(enums(INFOS)),
});

export type InfosSharedConfig = Infer<typeof infosSharedConfigStruct>;
