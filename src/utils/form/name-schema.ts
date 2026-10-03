import { atLeastVersion } from "../../ha";
import { HaFormSchema } from "./ha-form";

export const computeNameSchema = (version: string): HaFormSchema =>
  atLeastVersion(version, 2026, 4)
    ? {
        name: "name",
        selector: { entity_name: {} },
        context: { entity: "entity" },
      }
    : { name: "name", selector: { text: {} } };
