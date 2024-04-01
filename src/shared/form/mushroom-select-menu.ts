import {MenuBase} from '@material/mwc-menu/mwc-menu-base.js';
import {styles} from '@material/mwc-menu/mwc-menu.css.js';
import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import './mushroom-select-menu-surface.js';

/** */
@customElement('mushroom-select-menu')
export class Menu extends MenuBase {
  static styles = styles;
  override renderSurface() {
    const classes = this.getSurfaceClasses();
    // swap out mwc-menu surface for custom implementation
    // also force "fixed" behavior and turn off fullwidth since that won't work
    // with dialog. Alternatively these changes to defaults can be set in
    // mushroom-select-menu-surface.ts
    return html`
      <mushroom-select-menu-surface
        ?hidden=${!this.open}
        .anchor=${this.anchor}
        .open=${this.open}
        .quick=${this.quick}
        .corner=${this.corner}
        .x=${this.x}
        .y=${this.y}
        .absolute=${this.absolute}
        fixed
        .menuCorner=${this.menuCorner}
        ?stayOpenOnBodyClick=${this.stayOpenOnBodyClick}
        class=${classMap(classes)}
        @closed=${this.onClosed}
        @opened=${this.onOpened}
        @keydown=${this.onKeydown}>
      ${this.renderList()}
    </mushroom-select-menu-surface>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mushroom-select-menu': Menu;
  }
}
