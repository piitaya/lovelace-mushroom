import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { atLeastHaVersion, HomeAssistant, isAvailable } from "../../ha";

const MORE_INFO_MODE_CONTROL_NAME = "mushroom-vacuum-more-info-mode-control";

/**
 * Select menu for the vacuum cleaning mode, injected into Home Assistant's
 * vacuum more-info dialog next to the fan speed select.
 */
@customElement(MORE_INFO_MODE_CONTROL_NAME)
export class VacuumMoreInfoModeControl extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public modeEntityId?: string;

  private get _stateObj(): HassEntity | undefined {
    return this.modeEntityId ? this.hass?.states[this.modeEntityId] : undefined;
  }

  private _selectChanged(ev) {
    const stateObj = this._stateObj;
    if (!this.hass || !stateObj) return;
    const value: string | undefined = atLeastHaVersion(
      this.hass.connection.haVersion,
      2026,
      3
    )
      ? ev.detail.item.value
      : ev.target.value;

    if (value && value !== stateObj.state) {
      this.hass.callService(stateObj.entity_id.split(".")[0], "select_option", {
        entity_id: stateObj.entity_id,
        option: value,
      });
    }
  }

  protected render() {
    const stateObj = this._stateObj;
    if (!this.hass || !stateObj) return nothing;

    const options: string[] = stateObj.attributes.options ?? [];
    const label = this.hass.formatEntityName
      ? this.hass.formatEntityName(stateObj, { type: "entity" })
      : stateObj.attributes.friendly_name;

    if (atLeastHaVersion(this.hass.connection.haVersion, 2026, 3)) {
      return html`
        <ha-control-select-menu
          .label=${label}
          .hass=${this.hass}
          .value=${stateObj.state}
          .disabled=${!isAvailable(stateObj)}
          .options=${options.map((option) => ({
            value: option,
            label: this.hass!.formatEntityState(stateObj, option),
          }))}
          @wa-select=${this._selectChanged}
        >
          <ha-icon slot="icon" icon="mdi:broom"></ha-icon>
        </ha-control-select-menu>
      `;
    }

    return html`
      <ha-control-select-menu
        .label=${label}
        .hass=${this.hass}
        .value=${stateObj.state}
        .disabled=${!isAvailable(stateObj)}
        fixedMenuPosition
        naturalMenuWidth
        @closed=${(e) => e.stopPropagation()}
        @selected=${this._selectChanged}
      >
        <ha-icon slot="icon" icon="mdi:broom"></ha-icon>
        ${options.map(
          (option) => html`
            <ha-list-item .value=${option}>
              ${this.hass!.formatEntityState(stateObj, option)}
            </ha-list-item>
          `
        )}
      </ha-control-select-menu>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
      }
      ha-control-select-menu {
        width: 100%;
      }
    `;
  }
}

function deepQuery(
  root: ParentNode,
  predicate: (el: Element) => boolean,
  depth = 0
): Element | undefined {
  if (depth > 30) return undefined;
  for (const el of Array.from(root.children)) {
    if (predicate(el)) return el;
    const found =
      (el.shadowRoot && deepQuery(el.shadowRoot, predicate, depth + 1)) ||
      deepQuery(el, predicate, depth + 1);
    if (found) return found;
  }
  return undefined;
}

function findMoreInfoVacuum(vacuumEntityId: string): Element | undefined {
  const haRoot = document.querySelector("home-assistant")?.shadowRoot;
  if (!haRoot) return undefined;
  const dialog = haRoot.querySelector("ha-more-info-dialog");
  const searchRoot = dialog?.shadowRoot ?? haRoot;
  return deepQuery(
    searchRoot,
    (el) =>
      el.localName === "more-info-vacuum" &&
      (el as any).stateObj?.entity_id === vacuumEntityId
  );
}

function inject(
  moreInfo: Element,
  hass: HomeAssistant,
  modeEntityId: string
): VacuumMoreInfoModeControl | undefined {
  const root = moreInfo.shadowRoot;
  if (!root) return undefined;

  const existing = root.querySelector(
    MORE_INFO_MODE_CONTROL_NAME
  ) as VacuumMoreInfoModeControl | null;
  if (existing) {
    existing.hass = hass;
    existing.modeEntityId = modeEntityId;
    return existing;
  }

  const control = document.createElement(
    MORE_INFO_MODE_CONTROL_NAME
  ) as VacuumMoreInfoModeControl;
  control.hass = hass;
  control.modeEntityId = modeEntityId;

  // Place it next to the fan speed select when there is one
  const container = root.querySelector("ha-more-info-control-select-container");
  if (container) {
    container.appendChild(control);
  } else {
    const wrapper = document.createElement(
      "ha-more-info-control-select-container"
    );
    wrapper.appendChild(control);
    root.appendChild(wrapper);
  }
  return control;
}

/**
 * Wait for the vacuum more-info dialog to open, then add the cleaning mode
 * select to it. Returns the injected element through the callback so the
 * card can keep its hass up to date.
 */
export function injectModeControlInMoreInfo(
  vacuumEntityId: string,
  modeEntityId: string,
  getHass: () => HomeAssistant | undefined,
  onInjected: (control: VacuumMoreInfoModeControl) => void
) {
  const start = Date.now();
  const tryInject = () => {
    const hass = getHass();
    const moreInfo = hass ? findMoreInfoVacuum(vacuumEntityId) : undefined;
    const control =
      moreInfo && moreInfo.shadowRoot?.childElementCount
        ? inject(moreInfo, hass!, modeEntityId)
        : undefined;
    if (control) {
      onInjected(control);
      return;
    }
    if (Date.now() - start < 3000) {
      setTimeout(tryInject, 50);
    }
  };
  setTimeout(tryInject, 50);
}
