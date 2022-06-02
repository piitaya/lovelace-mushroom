import {
    Auth,
    Connection,
    HassConfig,
    HassEntities,
    HassServices,
    HassServiceTarget,
    MessageBase,
} from "home-assistant-js-websocket";
import { LocalizeFunc } from "./common/translations/localize";
import { FrontendLocaleData } from "./data/translation";
import { Themes } from "./data/ws-themes";

export interface ThemeSettings {
    theme: string;
    // Radio box selection for theme picker. Do not use in Lovelace rendering as
    // it can be undefined == auto.
    // Property hass.themes.darkMode carries effective current mode.
    dark?: boolean;
    primaryColor?: string;
    accentColor?: string;
}

export interface PanelInfo<T = Record<string, any> | null> {
    component_name: string;
    config: T;
    icon: string | null;
    title: string | null;
    url_path: string;
}

export interface Panels {
    [name: string]: PanelInfo;
}

export interface Resources {
    [language: string]: Record<string, string>;
}

export interface Translation {
    nativeName: string;
    isRTL: boolean;
    hash: string;
}

export interface TranslationMetadata {
    fragments: string[];
    translations: {
        [lang: string]: Translation;
    };
}

export interface Credential {
    auth_provider_type: string;
    auth_provider_id: string;
}

export interface MFAModule {
    id: string;
    name: string;
    enabled: boolean;
}

export interface CurrentUser {
    id: string;
    is_owner: boolean;
    is_admin: boolean;
    name: string;
    credentials: Credential[];
    mfa_modules: MFAModule[];
}

export interface ServiceCallRequest {
    domain: string;
    service: string;
    serviceData?: Record<string, any>;
    target?: HassServiceTarget;
}

export interface Context {
    id: string;
    parent_id?: string;
    user_id?: string | null;
}

export interface ServiceCallResponse {
    context: Context;
}

export interface HomeAssistant {
    auth: Auth;
    connection: Connection;
    connected: boolean;
    states: HassEntities;
    services: HassServices;
    config: HassConfig;
    themes: Themes;
    selectedTheme: ThemeSettings | null;
    panels: Panels;
    panelUrl: string;
    // i18n
    // current effective language in that order:
    //   - backend saved user selected language
    //   - language in local app storage
    //   - browser language
    //   - english (en)
    language: string;
    // local stored language, keep that name for backward compatibility
    selectedLanguage: string | null;
    locale: FrontendLocaleData;
    resources: Resources;
    localize: LocalizeFunc;
    translationMetadata: TranslationMetadata;
    suspendWhenHidden: boolean;
    enableShortcuts: boolean;
    vibrate: boolean;
    dockedSidebar: "docked" | "always_hidden" | "auto";
    defaultPanel: string;
    moreInfoEntityId: string | null;
    user?: CurrentUser;
    hassUrl(path?): string;
    callService(
        domain: ServiceCallRequest["domain"],
        service: ServiceCallRequest["service"],
        serviceData?: ServiceCallRequest["serviceData"],
        target?: ServiceCallRequest["target"]
    ): Promise<ServiceCallResponse>;
    callApi<T>(
        method: "GET" | "POST" | "PUT" | "DELETE",
        path: string,
        parameters?: Record<string, any>,
        headers?: Record<string, string>
    ): Promise<T>;
    fetchWithAuth(path: string, init?: Record<string, any>): Promise<Response>;
    sendWS(msg: MessageBase): void;
    callWS<T>(msg: MessageBase): Promise<T>;
}
