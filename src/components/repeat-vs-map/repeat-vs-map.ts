import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import styles from './repeat-vs-map.css?raw';

/** A list item with a stable identity used as the `repeat()` key. */
export interface DemoItem {
  id: string;
  label: string;
}

/**
 * Side-by-side demo of Lit list rendering with `Array.map()` versus keyed
 * `repeat()`. Type into the inputs, then shuffle or reverse the list: map
 * reuses DOM nodes by index (values stick to positions), while repeat moves
 * nodes with their item ids (values stay with the item).
 */
@customElement('repeat-vs-map')
export class RepeatVsMap extends LitElement {
  static override styles = unsafeCSS(styles);

  @state()
  private _items: DemoItem[] = [
    { id: 'a', label: 'Item A' },
    { id: 'b', label: 'Item B' },
    { id: 'c', label: 'Item C' },
    { id: 'd', label: 'Item D' },
  ];

  private _nextId = 5;

  /**
   * Renders the demo chrome, shared controls, and the two list panels.
   */
  protected override render(): TemplateResult {
    return html`
      <h1>map() vs repeat()</h1>
      <p class="lede">
        Type different text into each input, then shuffle or reverse. With
        <code>map()</code>, Lit reuses DOM by position, so typed values stay in
        place. With keyed <code>repeat()</code>, nodes move with their item
        <code>id</code>, so values travel with the row.
      </p>

      <div class="controls">
        <button type="button" @click=${this._shuffle}>Shuffle</button>
        <button type="button" @click=${this._reverse}>Reverse</button>
        <button type="button" @click=${this._addItem}>Add item</button>
        <button type="button" @click=${this._removeFirst}>Remove first</button>
      </div>

      <div class="panels">
        <section aria-labelledby="map-heading">
          <h2 id="map-heading">Array.map()</h2>
          <p class="hint">Keyed by index — DOM nodes stick to list positions.</p>
          <ul>
            ${this._renderMapList()}
          </ul>
        </section>

        <section aria-labelledby="repeat-heading">
          <h2 id="repeat-heading">repeat() with keys</h2>
          <p class="hint">Keyed by <code>id</code> — DOM nodes move with items.</p>
          <ul>
            ${this._renderRepeatList()}
          </ul>
        </section>
      </div>
    `;
  }

  /**
   * Renders the list with `Array.map()`, which associates templates with
   * array indexes rather than stable item identities.
   */
  private _renderMapList(): TemplateResult[] {
    return this._items.map(
      (item) => html`
        <li>
          <span class="label">${item.label}</span>
          <input
            type="text"
            placeholder="Type here…"
            aria-label="Note for ${item.label} (map list)"
          />
        </li>
      `
    );
  }

  /**
   * Renders the list with Lit's keyed `repeat()` so each item keeps the same
   * DOM node across reorder, insert, and remove operations.
   */
  private _renderRepeatList(): TemplateResult {
    return html`${repeat(
      this._items,
      (item) => item.id,
      (item) => html`
        <li>
          <span class="label">${item.label}</span>
          <input
            type="text"
            placeholder="Type here…"
            aria-label="Note for ${item.label} (repeat list)"
          />
        </li>
      `
    )}`;
  }

  /**
   * Randomizes item order with a Fisher–Yates shuffle and reassigns `_items`
   * so Lit schedules an update.
   */
  private _shuffle(): void {
    const next = [...this._items];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = next[i]!;
      next[i] = next[j]!;
      next[j] = tmp;
    }
    this._items = next;
  }

  /**
   * Reverses the current item order and reassigns `_items` to trigger render.
   */
  private _reverse(): void {
    this._items = [...this._items].reverse();
  }

  /**
   * Appends a new uniquely identified item to the end of the list.
   */
  private _addItem(): void {
    const id = String(this._nextId++);
    this._items = [
      ...this._items,
      { id, label: `Item ${id.toUpperCase()}` },
    ];
  }

  /**
   * Removes the first item when the list is non-empty.
   */
  private _removeFirst(): void {
    if (this._items.length === 0) {
      return;
    }
    this._items = this._items.slice(1);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'repeat-vs-map': RepeatVsMap;
  }
}
