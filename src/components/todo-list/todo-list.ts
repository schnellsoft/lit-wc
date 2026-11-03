import { LitElement, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import styles from './todo-list.css?raw';

export interface TodoEntry {
  id: string;
  title: string;
  completed: boolean;
}

/**
 * A simple todo list app.
 */
@customElement('todo-list')
export class TodoList extends LitElement {
  static override styles = unsafeCSS(styles);

  @state()
  private _items: TodoEntry[] = [];

  private _nextId = 1;

  protected override render(): TemplateResult {
    return html`
      <h1>Todo List</h1>
      <p class="lede">Press Enter or Add to create an item.</p>
      <div class="panel">
        ${this._items.length === 0
          ? html`<p class="empty">No todos yet.</p>`
          : html`
              <ul>
                ${repeat(
                  this._items,
                  (item) => item.id,
                  (item) => html`
                    <li class=${classMap({ done: item.completed })}>
                      <input
                        type="checkbox"
                        .checked=${item.completed}
                        aria-label="Complete ${item.title}"
                        @change=${() => this._toggle(item.id)}
                      />
                      <span class="title">${item.title}</span>
                    </li>
                  `
                )}
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
    `;
  }

  private _onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this._addFromInput();
    }
  }

  private _addFromInput(): void {
    const input = this.renderRoot.querySelector(
      '#todo-input'
    ) as HTMLInputElement | null;
    if (!input) {
      return;
    }
    const title = input.value.trim();
    if (!title) {
      return;
    }
    const id = String(this._nextId++);
    this._items = [...this._items, { id, title, completed: false }];
    input.value = '';
    input.focus();
  }

  private _toggle(id: string): void {
    this._items = this._items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'todo-list': TodoList;
  }
}
