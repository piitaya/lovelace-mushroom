// Borrowed from:
// https://github.com/custom-cards/boilerplate-card/blob/master/src/localize/localize.ts

import { HomeAssistant } from "custom-card-helpers";

import * as de from "./translations/de.json";
import * as en from "./translations/en.json";
import * as fr from "./translations/fr.json";
import * as it from "./translations/it.json";
import * as pt_BR from "./translations/pt-BR.json";
import * as sv from "./translations/sv.json";
import * as zh_Hans from "./translations/zh-Hans.json";
import * as nl from "./translations/nl.json";


const languages: Record<string, unknown> = {
    de,
    en,
    fr,
    it,
    "pt-BR": pt_BR,
    sv,
    "zh-Hans": zh_Hans,
    "nl": nl,
};

const DEFAULT_LANG = "en";

function getTranslatedString(key: string, lang: string): string | undefined {
    try {
        return key
            .split(".")
            .reduce((o, i) => (o as Record<string, unknown>)[i], languages[lang]) as string;
    } catch (_) {
        return undefined;
    }
}

export default function setupCustomlocalize(hass?: HomeAssistant) {
    return function (key: string) {
        const lang = hass?.locale.language ?? DEFAULT_LANG;

        let translated = getTranslatedString(key, lang);
        if (!translated) translated = getTranslatedString(key, DEFAULT_LANG);
        return translated ?? key;
    };
}
