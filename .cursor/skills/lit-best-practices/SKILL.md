---
name: lit-typescript
description: Best practices for writing Lit (Lit 3) web components in TypeScript. Use this skill whenever the user asks to create, review, refactor, or debug a Lit component, LitElement, reactive controller, web component, or custom element in TypeScript, or mentions @customElement, @property, @state, html`` templates, lit-html directives, @lit/context, @lit/task, or Shadow DOM styling. Also use it for tsconfig/build setup for Lit, typing custom events, testing Lit components, and exposing Lit components to React, Astro, Next.js, or WordPress. Use it even if the user only says "web component" and the project uses Lit or TypeScript.
---

# Lit + TypeScript

Rules and patterns for writing idiomatic, type-safe Lit 3 components in TypeScript. Always write TypeScript (`.ts`), never plain JS, and never `any` unless unavoidable (prefer `unknown` plus narrowing).

## 1. Project setup

### tsconfig.json (decorator-based, the documented default)

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "strict": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "declaration": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

Why these matter:
- `experimentalDecorators: true` and `useDefineForClassFields: false` are **required** for legacy `@property`/`@state` decorators. Without `useDefineForClassFields: false`, class fields shadow Lit's reactive accessors and properties silently stop triggering updates.
- `noImplicitOverride` forces `override` on lifecycle methods (`render`, `updated`, ...), which catches typos and signature drift.
- `strict` is non-negotiable.

Standard (TC39) decorators: Lit 3 also supports them with TS 5.2+ (drop `experimentalDecorators`, keep `useDefineForClassFields` default). Fields must then use the `accessor` keyword (`@property() accessor name = ''`). Do not mix both styles in one project.

### Dependencies

```bash
npm i lit
npm i -D typescript @open-wc/testing @web/test-runner @custom-elements-manifest/analyzer
# optional: @lit/context @lit/task @lit/localize @lit-labs/ssr
```

## 2. Component anatomy

```ts
import { LitElement, html, css, nothing, type PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type Variant = 'primary' | 'secondary';

@customElement('my-button')
export class MyButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      --my-button-bg: var(--brand-color, #5b21b6);
    }
    :host([hidden]) {
      display: none;
    }
    button {
      background: var(--my-button-bg);
      color: white;
      border: 0;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
    }
    button:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  `;

  /** Visual style. Reflected so CSS can target `:host([variant=...])`. */
  @property({ reflect: true }) variant: Variant = 'primary';

  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private _pressCount = 0;

  @query('button') private _button!: HTMLButtonElement;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('variant')) {
      // derive state here, before render
    }
  }

  protected override render() {
    return html`
      <button
        part="button"
        class=${classMap({ secondary: this.variant === 'secondary' })}
        ?disabled=${this.disabled}
        @click=${this._onClick}
      >
        <slot></slot>
        ${this._pressCount > 0 ? html`<span>${this._pressCount}</span>` : nothing}
      </button>
    `;
  }

  private _onClick(): void {
    this._pressCount++;
    this.dispatchEvent(
      new CustomEvent<{ count: number }>('my-press', {
        detail: { count: this._pressCount },
        bubbles: true,
        composed: true,
      })
    );
  }

  override focus(options?: FocusOptions): void {
    this._button?.focus(options);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-button': MyButton;
  }
  interface HTMLElementEventMap {
    'my-press': CustomEvent<{ count: number }>;
  }
}
```

Checklist for every component:
1. `@customElement('prefix-name')` with a hyphenated, namespaced tag.
2. `export` the class so it can be imported for types, tests, and subclassing.
3. `declare global { interface HTMLElementTagNameMap { ... } }` so `document.createElement('my-button')` and `querySelector('my-button')` are typed.
4. Register custom events in `HTMLElementEventMap` so `addEventListener('my-press', e => e.detail.count)` is typed.
5. Use `override` on every overridden member, including `static override styles`.
6. Mark lifecycle methods `protected override`.

## 3. Properties and state

| Need | Use |
|---|---|
| Public API, settable via attribute or property | `@property()` |
| Internal reactive data | `@state() private _x` |
| Non-reactive internal data | plain private field |

Rules:
- **Type the property explicitly or let the initializer infer it.** For unions, annotate: `@property() size: 'sm' | 'md' | 'lg' = 'md'`.
- **Always give a default value.** Every property must be valid at construction time. If a property can truly be absent, type it `T | undefined` and handle it in `render`.
- **Specify `type` for non-string attributes:** `Boolean`, `Number`. Strings need nothing. Note the TS type and the `type` option are independent: the compiler does not check that they match.
- **Objects, arrays, functions:** use `attribute: false`.
  ```ts
  @property({ attribute: false }) items: readonly Item[] = [];
  ```
- **Custom converters** for structured attributes:
  ```ts
  @property({
    converter: {
      fromAttribute: (v: string | null) => (v ? v.split(',').map((s) => s.trim()) : []),
      toAttribute: (v: string[]) => v.join(','),
    },
  })
  tags: string[] = [];
  ```
- **`reflect: true` only when CSS or selectors need the attribute** (e.g. `:host([variant=primary])`). Reflection has a cost and can create attribute noise.
- **Use `readonly` arrays/objects in types** to discourage in-place mutation.
- **Never mutate in place.** Reassign: `this.items = [...this.items, item]`. Otherwise call `this.requestUpdate()`.
- **Non-null assertion `!` is acceptable on `@query`** results, since they are defined after first render. Guard with `?.` if you access them earlier (e.g. in `connectedCallback`).
- **Do not use `@state` for derived data.** Compute it in `willUpdate` or inline in `render`.
- Use `static override properties`-style declarations only in decorator-free code; do not mix it with decorators on the same property.

### Typed `PropertyValues`
Use `PropertyValues<this>` (not bare `PropertyValues`) so `changed.has('variant')` is checked against real property names. Typos become compile errors.

## 4. Lifecycle

| Hook | Use for |
|---|---|
| `constructor` | set non-reactive defaults; no DOM access |
| `connectedCallback` | add global listeners/observers (`window`, `document`, `ResizeObserver`); call `super.connectedCallback()` |
| `disconnectedCallback` | remove everything added above; call `super.disconnectedCallback()` |
| `willUpdate(changed)` | compute derived values before render |
| `render()` | pure template; no side effects, no property writes |
| `firstUpdated` | one-time DOM setup after first render |
| `updated(changed)` | DOM-dependent reactions to changes (measure, focus) |
| `updateComplete` | `await el.updateComplete` after changing properties, before reading DOM |

Always call `super` in `connectedCallback`/`disconnectedCallback`. Prefer reactive controllers (section 7) over manual listener bookkeeping when the logic is reusable.

## 5. Templates

- Use **declarative bindings**: `@click=${this._onClick}` (Lit binds `this` for you), `.prop=${value}`, `?bool=${flag}`, `attr=${value}`.
- Use `.prop=` to pass non-string data to children, never `attr=` with `JSON.stringify`.
- Conditional rendering: ternary with `nothing` for the empty branch; `when()` from `lit/directives/when.js` for larger branches.
- Lists: `map()` for static lists; `repeat(items, (i) => i.id, (i) => html`...`)` when items reorder or hold state.
- Dynamic classes and styles: `classMap`, `styleMap`; never string concatenation.
- `ifDefined(value)` for optional attributes (`ifDefined(this.href)`).
- `ref()` / `createRef<HTMLInputElement>()` for typed DOM access inside templates, as an alternative to `@query`.
- Keep inline handlers as class methods rather than arrow functions in the template when the function is passed to children (avoids new identity every render).
- Type template helpers as `TemplateResult` (`import type { TemplateResult } from 'lit'`) and extract sub-templates into private methods like `_renderHeader(): TemplateResult`.
- Never build HTML from strings. Avoid `unsafeHTML` unless the content is sanitized.

## 6. Events

- Data **down** via properties, **up** via events.
- Always type the detail: `new CustomEvent<Detail>('name', { detail, ... })`.
- Export the detail types so consumers can import them:
  ```ts
  export interface ItemSelectDetail { id: string }
  export type ItemSelectEvent = CustomEvent<ItemSelectDetail>;
  ```
- Event names: lowercase, kebab-case, prefixed (`acme-item-select`); never reuse native event names for custom semantics.
- `bubbles: true, composed: true` **only** when the event must cross shadow boundaries to reach ancestors. Otherwise leave both off so the surface area stays small.
- Register in `HTMLElementEventMap` (see section 2) for type-safe `addEventListener`.
- Typed listener in templates: `@item-select=${(e: ItemSelectEvent) => ...}`.

## 7. Reactive controllers (reusable logic)

```ts
import type { ReactiveController, ReactiveControllerHost } from 'lit';

export class MediaQueryController implements ReactiveController {
  matches = false;
  private _mql: MediaQueryList;

  constructor(private host: ReactiveControllerHost, query: string) {
    this._mql = window.matchMedia(query);
    host.addController(this);
  }

  hostConnected(): void {
    this.matches = this._mql.matches;
    this._mql.addEventListener('change', this._onChange);
  }

  hostDisconnected(): void {
    this._mql.removeEventListener('change', this._onChange);
  }

  private _onChange = (e: MediaQueryListEvent): void => {
    this.matches = e.matches;
    this.host.requestUpdate();
  };
}

// usage
// private _narrow = new MediaQueryController(this, '(max-width: 600px)');
```

Prefer controllers over mixins for shared behavior. If you need a mixin, type it properly:

```ts
type Constructor<T = {}> = new (...args: any[]) => T;

export const WithTheme = <T extends Constructor<LitElement>>(Base: T) => {
  class ThemedElement extends Base {
    @property({ reflect: true }) theme: 'light' | 'dark' = 'light';
  }
  return ThemedElement as Constructor<{ theme: 'light' | 'dark' }> & T;
};
```

## 8. Async data: `@lit/task`

```ts
import { Task } from '@lit/task';

private _user = new Task(this, {
  task: async ([id], { signal }) => {
    const res = await fetch(`/api/users/${id}`, { signal });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as User;
  },
  args: () => [this.userId] as const,
});

render() {
  return this._user.render({
    pending: () => html`<p>Loading…</p>`,
    complete: (u) => html`<p>${u.name}</p>`,
    error: (e) => html`<p>Failed: ${String(e)}</p>`,
  });
}
```

- Use `as const` on `args` so the tuple is typed.
- Always forward the `signal` to `fetch` so stale requests are aborted.
- Validate untrusted JSON at the boundary (e.g. zod) instead of trusting an `as` cast in production code.

## 9. Shared state: `@lit/context`

```ts
// theme-context.ts
import { createContext } from '@lit/context';
export interface Theme { primary: string }
export const themeContext = createContext<Theme>(Symbol('theme'));

// provider
import { provide } from '@lit/context';
@provide({ context: themeContext }) @property({ attribute: false }) theme: Theme = { primary: '#5b21b6' };

// consumer
import { consume } from '@lit/context';
@consume({ context: themeContext, subscribe: true }) @state() private _theme?: Theme;
```

- Use a `Symbol` key and export a single typed context object.
- Consumers must handle `undefined` (no provider) gracefully.
- Use context for cross-cutting data (theme, locale, auth, config), not as a substitute for ordinary property passing.

## 10. Styling

- `static override styles = css\`...\`` (or an array to compose shared sheets). Shared `css` results are adopted, not duplicated per instance.
- Put shared styles in their own `.ts` module exporting a `CSSResult`:
  ```ts
  import { css } from 'lit';
  export const resetStyles = css`:host { box-sizing: border-box; } *, *::before, *::after { box-sizing: inherit; }`;
  ```
- **Theming surface** = CSS custom properties (with fallbacks) + `part` attributes + slots. Document each in JSDoc (`@cssprop`, `@csspart`, `@slot`) so the Custom Elements Manifest picks them up.
- Always style `:host` (at minimum `display`) and handle `:host([hidden])`.
- Don't interpolate user strings into `css`; use `unsafeCSS` only with trusted values.
- Respect `prefers-reduced-motion` and `prefers-color-scheme` where you animate or theme.

## 11. Accessibility

- Prefer native elements (`<button>`, `<a>`, `<input>`) inside the shadow root.
- Set `role`, `aria-*`, and keyboard handlers when building custom widgets. Provide visible `:focus-visible` styles.
- Composite widgets: `static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };`
- Remember ARIA IDREFs (`aria-labelledby`) do not cross shadow boundaries; prefer `aria-label` or ElementInternals (`this.attachInternals().ariaLabel`).
- **Form-associated components:**
  ```ts
  static formAssociated = true;
  private _internals = this.attachInternals();
  // this._internals.setFormValue(this.value);
  // this._internals.setValidity({ valueMissing: true }, 'Required', this._input);
  ```

## 12. Performance

- Keep `render()` cheap and pure; hoist constants out of it.
- Use `repeat` with stable keys for reorderable lists; use `guard`/`cache` only after measuring.
- Lazy-load heavy components: `await import('./heavy-chart.js')` (note the `.js` extension in TS imports under `moduleResolution: Bundler/NodeNext` configs that require it).
- Use `shouldUpdate()` only for proven hotspots.
- Batch property changes; Lit already batches renders in a microtask.
- Avoid `@property` on values that change per frame; use a plain field plus `requestUpdate()` on a schedule.

## 13. SSR and framework interop

- Browser-only APIs (`window`, `document`, `matchMedia`, `localStorage`) go in `connectedCallback`/`firstUpdated`/controllers, never in constructors, field initializers, or `render()`.
- Keep the initial render deterministic so hydration matches.
- Under `@lit-labs/ssr`, only `willUpdate`/`render` run on the server.
- **React:** use `@lit/react`'s `createComponent` for typed wrappers (maps events to `onX` props and properties correctly):
  ```ts
  import { createComponent } from '@lit/react';
  export const MyButtonReact = createComponent({
    tagName: 'my-button',
    elementClass: MyButton,
    react: React,
    events: { onMyPress: 'my-press' },
  });
  ```
- **Astro / Next.js / WordPress:** treat the component as a plain custom element. Pass primitives via attributes, complex data via a property set from a small script or JSON `<script type="application/json">`. Ensure the module is only imported client-side where required, and register elements idempotently.
- Avoid double registration across bundles: `if (!customElements.get('my-button')) customElements.define('my-button', MyButton);` when you cannot use `@customElement`.

## 14. Packaging

- Ship ES modules with `.d.ts` files (`"declaration": true`), set `"type": "module"`, and define `exports`, `types`, `sideEffects` (list the files that register elements).
- Generate a **Custom Elements Manifest** (`custom-elements-manifest.json`) with `@custom-elements-manifest/analyzer` and reference it via `"customElements"` in `package.json`.
- Export both the class and a side-effect-free entry (`index.ts` re-exports classes) and a registering entry (`define.ts` imports components), so consumers can choose.
- Peer-depend on `lit` (do not bundle it) to avoid duplicate Lit copies.

## 15. Testing

```ts
import { fixture, html, expect } from '@open-wc/testing';
import './my-button.js';
import type { MyButton } from './my-button.js';

describe('my-button', () => {
  it('reflects variant', async () => {
    const el = await fixture<MyButton>(html`<my-button variant="secondary">Hi</my-button>`);
    expect(el.getAttribute('variant')).to.equal('secondary');
  });

  it('fires my-press', async () => {
    const el = await fixture<MyButton>(html`<my-button>Hi</my-button>`);
    setTimeout(() => el.shadowRoot!.querySelector('button')!.click());
    const ev = await oneEvent(el, 'my-press');
    expect(ev.detail.count).to.equal(1);
  });
});
```

- Run in a real browser (Web Test Runner or Vitest browser mode), not jsdom.
- `await el.updateComplete` after changing a property, before asserting on the DOM.
- Add `await expect(el).shadowDom.to.be.accessible()` (axe) for accessibility checks.
- Test public API (properties, events, slots, parts), not private fields.

## 16. Common TypeScript pitfalls

| Symptom | Cause / fix |
|---|---|
| Property changes do nothing | `useDefineForClassFields` is `true`; set it to `false` (legacy decorators) |
| "Unable to resolve signature of property decorator" | Missing `experimentalDecorators`, or mixing legacy and standard decorators |
| `Property 'x' has no initializer` | Add a default value, or `!` only for `@query` fields |
| `changed.has('typo')` compiles | Use `PropertyValues<this>` |
| `document.createElement('my-el')` is `HTMLElement` | Missing `HTMLElementTagNameMap` entry |
| `addEventListener('my-event', e => e.detail)` errors | Missing `HTMLElementEventMap` entry |
| Class `static styles` type error | Add `override`, or type as `CSSResultGroup` |
| Array/object updates don't re-render | Mutated in place; reassign instead |
| Attribute always a string | Missing `type: Number`/`Boolean` or a custom `converter` |
| Import fails at runtime | Add `.js` extension to relative imports when required by the module resolution setting |

## 17. Review checklist (use when reviewing Lit code)

- [ ] tsconfig has the right decorator flags and `strict`
- [ ] Tag name is namespaced and present in `HTMLElementTagNameMap`
- [ ] Every property has a type, a default, and the right `type`/`attribute`/`reflect` options
- [ ] No in-place mutation of arrays/objects
- [ ] `render()` is pure; derived values live in `willUpdate`
- [ ] Global listeners are added and removed symmetrically (or use a controller)
- [ ] Events are typed, kebab-case, and only `composed` when necessary
- [ ] Styling hooks are documented (`@cssprop`, `@csspart`, `@slot`)
- [ ] Accessible: native elements, labels, focus styles, keyboard support
- [ ] No browser-only APIs on the server path
- [ ] Tests await `updateComplete` and run in a real browser