import {MenuSurfaceBase} from '@material/mwc-menu/mwc-menu-surface-base.js';
import {styles} from '@material/mwc-menu/mwc-menu-surface.css.js';
import {html, css} from 'lit';
import {customElement, query} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {styleMap} from 'lit/directives/style-map.js';

/** */
@customElement('mushroom-select-menu-surface')
export class MenuSurface extends MenuSurfaceBase {
  static override styles = [
    styles,
    css`
      dialog {
        border: 0px;
      }
    
      dialog::backdrop {
        /* must still be clickable */
        opacity: 0;
      }
    
      slot {
        /* Makes slot clickable */
        display: block;
      }`
  ];

  @query('dialog') dialogEl!: HTMLDialogElement | null;

  override renderSurface() {
    const classes = this.getRootClasses();
    const styles = this.getRootStyles();

    // swap out div for dialog
    return html`
      <dialog
          class=${classMap(classes)}
          style="${styleMap(styles)}"
          @click=${this.onScrimClick}
          @keydown=${this.onKeydown}
          @opened=${this.registerBodyClick}
          @closed=${this.deregisterBodyClick}>
        ${this.renderContent()}
      </dialog>`;
  }

  protected onScrimClick(e: Event) {
    // This would be false if the contents of the dialog were clicked rather
    // than the transparent scrim
    if (e.target === this.dialogEl) {
      this.open = false;
    }
  }

  override onOpenChanged(isOpen: boolean, wasOpen: boolean) {
    super.onOpenChanged(isOpen, wasOpen);
    if (this.dialogEl) {
      if (isOpen) {
        // MUST use showModal over `open` because this is the only thing that
        // will trigger the browser's super special hoisting mechanism
        this.dialogEl.showModal();
      } else {
        this.dialogEl.close();
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mushroom-select-menu-surface': MenuSurface;
  }
}
