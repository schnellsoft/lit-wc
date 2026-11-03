import{a as e,c as t,i as n,n as r,o as i,r as a,t as o}from"./theme-toggle-D65FH-Fh.js";import{i as s,n as c,r as l,t as u}from"./repeat-DbkgISwB.js";var d=c(class extends l{constructor(e){if(super(e),e.type!==s.ATTRIBUTE||e.name!==`class`||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return` `+Object.keys(e).filter(t=>e[t]).join(` `)+` `}update(t,[n]){if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(` `).split(/\s/).filter(e=>e!==``)));for(let e in n)n[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(n)}let r=t.element.classList;for(let e of this.st)e in n||(r.remove(e),this.st.delete(e));for(let e in n){let t=!!n[e];t===this.st.has(e)||this.nt?.has(e)||(t?(r.add(e),this.st.add(e)):(r.remove(e),this.st.delete(e)))}return e}}),f=`:host {
  display: block;
  box-sizing: border-box;
  width: min(480px, 100%);
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
  margin: 0 0 0.35rem;
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.lede {
  margin: 0 0 1.25rem;
  color: var(--muted, #4b5563);
  font-size: 0.95rem;
}

.panel {
  border: 1px solid var(--panel-edge, #e5e7eb);
  border-radius: 0.5rem;
  padding: 1rem;
  background: var(--panel, #fff);
}

ul {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 2.5rem;
}

.empty {
  margin: 0 0 1rem;
  color: var(--muted-soft, #6b7280);
  font-size: 0.9rem;
}

li {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.7rem;
  border-radius: 0.375rem;
  background: var(--row, #f3f4f6);
}

li.done .title {
  text-decoration: line-through;
  color: var(--muted-soft, #6b7280);
}

input[type='checkbox'] {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--accent, #2563eb);
  cursor: pointer;
}

.title {
  font-weight: 500;
  word-break: break-word;
}

.add-row {
  display: flex;
  gap: 0.5rem;
}

input[type='text'] {
  font: inherit;
  flex: 1;
  min-width: 0;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--control-edge, #d1d5db);
  border-radius: 0.375rem;
  background: var(--control-bg, #fff);
  color: inherit;
}

input[type='text']:focus-visible {
  outline: 2px solid var(--accent, #2563eb);
  outline-offset: 1px;
}

button {
  font: inherit;
  cursor: pointer;
  padding: 0.45rem 0.85rem;
  border: 1px solid var(--accent, #2563eb);
  border-radius: 0.375rem;
  background: var(--accent, #2563eb);
  color: var(--on-accent, #fff);
  font-weight: 600;
  white-space: nowrap;
}

button:hover {
  background: var(--accent-hover, #1d4ed8);
}

button:focus-visible {
  outline: 2px solid var(--accent, #2563eb);
  outline-offset: 2px;
}
`,p=class extends n{constructor(...e){super(...e),this._items=[],this._nextId=1}static{this.styles=t(f)}render(){return i`
      <h1>Todo List</h1>
      <p class="lede">Press Enter or Add to create an item.</p>
      <div class="panel">
        ${this._items.length===0?i`<p class="empty">No todos yet.</p>`:i`
              <ul>
                ${u(this._items,e=>e.id,e=>i`
                    <li class=${d({done:e.completed})}>
                      <input
                        type="checkbox"
                        .checked=${e.completed}
                        aria-label="Complete ${e.title}"
                        @change=${()=>this._toggle(e.id)}
                      />
                      <span class="title">${e.title}</span>
                    </li>
                  `)}
              </ul>
            `}
        <div class="add-row">
          <input
            id="todo-input"
            type="text"
            placeholder="Add a new todo"
            aria-label="New todo title"
            @keydown=${this._onKeydown}
          />
          <button type="button" @click=${this._addFromInput}>Add</button>
        </div>
      </div>
    `}_onKeydown(e){e.key===`Enter`&&this._addFromInput()}_addFromInput(){let e=this.renderRoot.querySelector(`#todo-input`);if(!e)return;let t=e.value.trim();if(!t)return;let n=String(this._nextId++);this._items=[...this._items,{id:n,title:t,completed:!1}],e.value=``,e.focus()}_toggle(e){this._items=this._items.map(t=>t.id===e?{...t,completed:!t.completed}:t)}};o([r()],p.prototype,`_items`,void 0),p=o([a(`todo-list`)],p);