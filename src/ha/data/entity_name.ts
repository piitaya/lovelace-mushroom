export type EntityNameItem =
  | {
      type: "entity" | "device" | "area" | "floor";
    }
  | {
      type: "text";
      text: string;
    };

export interface EntityNameOptions {
  separator?: string;
}

export interface EntityNameSelector {
  entity_name: {
    entity_id?: string;
    default_name?: EntityNameItem | EntityNameItem[] | string;
  } | null;
}
