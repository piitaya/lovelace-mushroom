import { LocalizeFunc } from "../common/translations/localize";

export interface IntegrationManifest {
    is_built_in: boolean;
    domain: string;
    name: string;
    config_flow: boolean;
    documentation: string;
    issue_tracker?: string;
    dependencies?: string[];
    after_dependencies?: string[];
    codeowners?: string[];
    requirements?: string[];
    ssdp?: Array<{ manufacturer?: string; modelName?: string; st?: string }>;
    zeroconf?: string[];
    homekit?: { models: string[] };
    quality_scale?: "gold" | "internal" | "platinum" | "silver";
    iot_class: "assumed_state" | "cloud_polling" | "cloud_push" | "local_polling" | "local_push";
}

export const domainToName = (
    localize: LocalizeFunc,
    domain: string,
    manifest?: IntegrationManifest
) => localize(`component.${domain}.title`) || manifest?.name || domain;
