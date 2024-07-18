import { HomeAssistant } from "./ha";
import * as ar from "./translations/ar.json";
import * as bg from "./translations/bg.json";
import * as ca from "./translations/ca.json";
import * as cs from "./translations/cs.json";
import * as da from "./translations/da.json";
import * as de from "./translations/de.json";
import * as el from "./translations/el.json";
import * as en from "./translations/en.json";
import * as es from "./translations/es.json";
import * as fi from "./translations/fi.json";
import * as fr from "./translations/fr.json";
import * as he from "./translations/he.json";
import * as hu from "./translations/hu.json";
import * as id from "./translations/id.json";
import * as it from "./translations/it.json";
import * as ko_KR from "./translations/ko-KR.json";
import * as nb from "./translations/nb.json";
import * as nl from "./translations/nl.json";
import * as pl from "./translations/pl.json";
import * as pt_BR from "./translations/pt-BR.json";
import * as pt_PT from "./translations/pt-PT.json";
import * as ro from "./translations/ro.json";
import * as ru from "./translations/ru.json";
import * as sl from "./translations/sl.json";
import * as sk from "./translations/sk.json";
import * as sv from "./translations/sv.json";
import * as tr from "./translations/tr.json";
import * as uk from "./translations/uk.json";
import * as vi from "./translations/vi.json";
import * as zh_Hans from "./translations/zh-Hans.json";
import * as zh_Hant from "./translations/zh-Hant.json";

const languages: Record<string, unknown> = {
  ar,
  bg,
  ca,
  cs,
  da,
  de,
  el,
  en,
  es,
  fi,
  fr,
  he,
  hu,
  id,
  it,
  "ko-KR": ko_KR,
  nb,
  nl,
  pl,
  "pt-BR": pt_BR,
  "pt-PT": pt_PT,
  ro,
  ru,
  sl,
  sk,
  sv,
  tr,
  uk,
  vi,
  "zh-Hans": zh_Hans,
  "zh-Hant": zh_Hant,
};

const DEFAULT_LANG = "en";

function getTranslatedString(key: string, lang: string): string | undefined {
  try {
    return key
      .split(".")
      .reduce(
        (o, i) => (o as Record<string, unknown>)[i],
        languages[lang]
      ) as string;
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
