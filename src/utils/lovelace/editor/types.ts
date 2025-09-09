import {
  ActionConfig,
  LovelaceBadgeConfig,
  LovelaceCardConfig,
  LovelaceCardFeatureConfig,
  LovelaceViewConfig,
  ShowViewConfig,
} from "../../../ha";
import { LovelaceChipConfig } from "../chip/types";

export interface YamlChangedEvent extends Event {
  detail: {
    yaml: string;
  };
}

export interface GUIModeChangedEvent {
  guiMode: boolean;
  guiModeAvailable: boolean;
}

export interface ViewEditEvent extends Event {
  detail: {
    config: LovelaceViewConfig;
  };
}

export interface ViewVisibilityChangeEvent {
  visible: ShowViewConfig[];
}

export interface ConfigValue {
  format: "json" | "yaml";
  value?: string | LovelaceCardConfig;
}

export interface ConfigError {
  type: string;
  message: string;
}

export interface EntityConfig {
  entity: string;
  type?: string;
  name?: string;
  icon?: string;
  image?: string;
}

export interface EntitiesEditorEvent extends CustomEvent {
  detail: {
    entities?: EntityConfig[];
    item?: any;
  };
  target: EventTarget | null;
}

export interface EditorTarget extends EventTarget {
  value?: string;
  index?: number;
  checked?: boolean;
  configValue?: string;
  type?: HTMLInputElement["type"];
  config: ActionConfig;
}

export interface Card {
  type: string;
  name?: string;
  description?: string;
  showElement?: boolean;
  isCustom?: boolean;
  isSuggested?: boolean;
}

export interface Badge {
  type: string;
  name?: string;
  description?: string;
  showElement?: boolean;
  isCustom?: boolean;
  isSuggested?: boolean;
}

export interface LovelaceHeaderFooterConfig {
  type: "buttons" | "graph" | "picture";
}

export interface HeaderFooter {
  type: LovelaceHeaderFooterConfig["type"];
  icon?: string;
}

export interface CardPickTarget extends EventTarget {
  config: LovelaceCardConfig;
}

export interface BadgePickTarget extends EventTarget {
  config: LovelaceBadgeConfig;
}

export interface SubElementEditorConfig {
  index?: number;
  elementConfig?: LovelaceCardFeatureConfig | LovelaceChipConfig;
  saveElementConfig?: (elementConfig: any) => void;
  context?: any;
  type:
    | "header"
    | "footer"
    | "row"
    | "feature"
    | "element"
    | "heading-badge"
    | "chip";
}

export interface EditSubElementEvent<T = any, C = any> {
  type: SubElementEditorConfig["type"];
  context?: C;
  config: T;
  saveConfig: (config: T) => void;
}

export interface EditDetailElementEvent {
  subElementConfig: SubElementEditorConfig;
}
