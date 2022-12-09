// import { LovelaceCardConfig, LovelaceConfig } from "../../data/lovelace";
import { Constructor, HomeAssistant } from "../types";

declare global {
    // eslint-disable-next-line
    interface HASSDomEvents {
        "ll-rebuild": Record<string, unknown>;
        "ll-badge-rebuild": Record<string, unknown>;
    }
}

export interface ShowViewConfig {
    user?: string;
}

export interface LovelaceCardConfig {
    index?: number;
    view_index?: number;
    view_layout?: any;
    type: string;
    [key: string]: any;
}

export interface LovelaceViewConfig {
    index?: number;
    title?: string;
    type?: string;
    strategy?: {
        type: string;
        options?: Record<string, unknown>;
    };
    cards?: LovelaceCardConfig[];
    path?: string;
    icon?: string;
    theme?: string;
    panel?: boolean;
    background?: string;
    visible?: boolean | ShowViewConfig[];
}

export interface LovelaceResource {
    id: string;
    type: "css" | "js" | "module" | "html";
    url: string;
}

export interface LovelaceConfig {
    title?: string;
    strategy?: {
        type: string;
        options?: Record<string, unknown>;
    };
    views: LovelaceViewConfig[];
    background?: string;
}

export interface Lovelace {
    config: LovelaceConfig;
    // If not set, a strategy was used to generate everything
    rawConfig: LovelaceConfig | undefined;
    editMode: boolean;
    urlPath: string | null;
    mode: "generated" | "yaml" | "storage";
    locale: any;
    enableFullEditMode: () => void;
    setEditMode: (editMode: boolean) => void;
    saveConfig: (newConfig: LovelaceConfig) => Promise<void>;
    deleteConfig: () => Promise<void>;
}

export interface LovelaceCard extends HTMLElement {
    hass?: HomeAssistant;
    isPanel?: boolean;
    editMode?: boolean;
    getCardSize(): number | Promise<number>;
    setConfig(config: LovelaceCardConfig): void;
}

export interface LovelaceCardConstructor extends Constructor<LovelaceCard> {
    getStubConfig?: (
        hass: HomeAssistant,
        entities: string[],
        entitiesFallback: string[]
    ) => LovelaceCardConfig;
    getConfigElement?: () => LovelaceCardEditor;
}

export interface LovelaceCardEditor extends LovelaceGenericElementEditor {
    setConfig(config: LovelaceCardConfig): void;
}

export interface LovelaceGenericElementEditor extends HTMLElement {
    hass?: HomeAssistant;
    lovelace?: LovelaceConfig;
    setConfig(config: any): void;
    focusYamlEditor?: () => void;
}