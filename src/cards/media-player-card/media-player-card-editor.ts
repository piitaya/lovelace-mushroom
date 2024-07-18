import { html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { LocalizeFunc, LovelaceCardEditor, fireEvent } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { APPEARANCE_FORM_SCHEMA } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import {
  MEDIA_PLAYER_CARD_EDITOR_NAME,
  MEDIA_PLAYER_ENTITY_DOMAINS,
} from "./const";
import {
  MEDIA_LAYER_MEDIA_CONTROLS,
  MEDIA_PLAYER_VOLUME_CONTROLS,
  MediaPlayerCardConfig,
  mediaPlayerCardConfigStruct,
} from "./media-player-card-config";

export const MEDIA_LABELS = [
  "use_media_info",
  "use_media_artwork",
  "show_volume_level",
  "media_controls",
  "volume_controls",
];

const computeSchema = memoizeOne((localize: LocalizeFunc): HaFormSchema[] => [
  {
    name: "entity",
    selector: { entity: { domain: MEDIA_PLAYER_ENTITY_DOMAINS } },
  },
  { name: "name", selector: { text: {} } },
  { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } },
  ...APPEARANCE_FORM_SCHEMA,
  {
    type: "grid",
    name: "",
    schema: [
      { name: "use_media_info", selector: { boolean: {} } },
      { name: "show_volume_level", selector: { boolean: {} } },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "volume_controls",
        selector: {
          select: {
            options: MEDIA_PLAYER_VOLUME_CONTROLS.map((control) => ({
              value: control,
              label: localize(
                `editor.card.media-player.volume_controls_list.${control}`
              ),
            })),
            mode: "list",
            multiple: true,
          },
        },
      },
      {
        name: "media_controls",
        selector: {
          select: {
            options: MEDIA_LAYER_MEDIA_CONTROLS.map((control) => ({
              value: control,
              label: localize(
                `editor.card.media-player.media_controls_list.${control}`
              ),
            })),
            mode: "list",
            multiple: true,
          },
        },
      },
      { name: "collapsible_controls", selector: { boolean: {} } },
    ],
  },
  ...computeActionsFormSchema(),
]);

@customElement(MEDIA_PLAYER_CARD_EDITOR_NAME)
export class MediaCardEditor
  extends MushroomBaseElement
  implements LovelaceCardEditor
{
  @state() private _config?: MediaPlayerCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: MediaPlayerCardConfig): void {
    assert(config, mediaPlayerCardConfigStruct);
    this._config = config;
  }

  private _computeLabel = (schema: HaFormSchema) => {
    const customLocalize = setupCustomlocalize(this.hass!);

    if (GENERIC_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.generic.${schema.name}`);
    }
    if (MEDIA_LABELS.includes(schema.name)) {
      return customLocalize(`editor.card.media-player.${schema.name}`);
    }
    return this.hass!.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
  };

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const customLocalize = setupCustomlocalize(this.hass!);
    const schema = computeSchema(customLocalize);

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, "config-changed", { config: ev.detail.value });
  }
}
