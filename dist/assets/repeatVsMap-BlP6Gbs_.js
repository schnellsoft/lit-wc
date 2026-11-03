import{c as e,i as t,n,o as r,r as i,t as a}from"./theme-toggle-D65FH-Fh.js";import{t as o}from"./repeat-DbkgISwB.js";var s=`:host {
  display: block;
  box-sizing: border-box;
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 1.5rem;
  font: 16px/1.45 system-ui, 'Segoe UI', Roboto, sans-serif;
  color: var(--ink, #1f2937);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.lede {
  margin: 0 0 1.25rem;
  max-width: 52rem;
  color: var(--muted, #4b5563);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

button {
  font: inherit;
  cursor: pointer;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--control-edge, #d1d5db);
  border-radius: 0.375rem;
  background: var(--control-fill, #f9fafb);
  color: inherit;
}

button:hover {
  background: var(--control-fill-hover, #f3f4f6);
}

button:focus-visible {
  outline: 2px solid var(--accent, #2563eb);
  outline-offset: 2px;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 720px) {
  .panels {
    grid-template-columns: 1fr;
  }
}

section {
  border: 1px solid var(--panel-edge, #e5e7eb);
  border-radius: 0.5rem;
  padding: 1rem;
  background: var(--panel, #fff);
}

section h2 {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.hint {
  margin: 0 0 0.85rem;
  font-size: 0.875rem;
  color: var(--muted-soft, #6b7280);
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

li {
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.65rem;
  border-radius: 0.375rem;
  background: var(--row, #f3f4f6);
}

.label {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

input {
  font: inherit;
  width: 100%;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--control-edge, #d1d5db);
  border-radius: 0.25rem;
  background: var(--control-bg, #fff);
  color: inherit;
}

input:focus-visible {
  outline: 2px solid var(--accent, #2563eb);
  outline-offset: 1px;
}
`,c=class extends t{constructor(...e){super(...e),this._items=[{id:`a`,label:`Item A`},{id:`b`,label:`Item B`},{id:`c`,label:`Item C`},{id:`d`,label:`Item D`}],this._nextId=5}static{this.styles=e(s)}render(){return r`
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
    `}_renderMapList(){return this._items.map(e=>r`
        <li>
          <span class="label">${e.label}</span>
          <input
            type="text"
            placeholder="Type here…"
            aria-label="Note for ${e.label} (map list)"
          />
        </li>
      `)}_renderRepeatList(){return r`${o(this._items,e=>e.id,e=>r`
        <li>
          <span class="label">${e.label}</span>
          <input
            type="text"
            placeholder="Type here…"
            aria-label="Note for ${e.label} (repeat list)"
          />
        </li>
      `)}`}_shuffle(){let e=[...this._items];for(let t=e.length-1;t>0;t--){let n=Math.floor(Math.random()*(t+1)),r=e[t];e[t]=e[n],e[n]=r}this._items=e}_reverse(){this._items=[...this._items].reverse()}_addItem(){let e=String(this._nextId++);this._items=[...this._items,{id:e,label:`Item ${e.toUpperCase()}`}]}_removeFirst(){this._items.length!==0&&(this._items=this._items.slice(1))}};a([n()],c.prototype,`_items`,void 0),c=a([i(`repeat-vs-map`)],c);