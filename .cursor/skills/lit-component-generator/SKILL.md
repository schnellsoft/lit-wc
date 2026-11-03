---
name: lit-component-generator
description: Generates production-ready Lit 3 web components in TypeScript, including the component file, shared styles, typed events, global type declarations, a test file, and an index export. Use this skill whenever the user asks to create, scaffold, generate, or add a Lit component, LitElement, web component, or custom element, or asks for a new UI element (button, card, modal, dropdown, tabs, form field, slideshow, etc.) in a project that uses Lit or web components. Also use it when converting a React, Vue, or plain HTML snippet into a Lit component, even if the user never says "Lit" explicitly but the repo already depends on `lit`.
---

# Lit Component Generator

Generate Lit 3 components in **TypeScript only**. Follow this workflow every time, in order.

## Step 1: Inspect the project before writing anything

Do these checks first and adapt to what you find. Do not assume.

1. Read `package.json`: confirm `lit` is installed and note the version (Lit 3 expected), the package manager, and the test runner.
2. Read `tsconfig.json`: check `experimentalDecorators` and `useDefineForClassFields`.
   - If `experimentalDecorators: true` and `useDefineForClassFields: false`: use legacy decorators (`@customElement`, `@property`, `@state`).
   - If the project uses standard decorators: fields need the `accessor` keyword.
   - If neither is configured and the user has not asked for decorators: fix the tsconfig only if the user agrees; otherwise generate decorator-free code with `static override properties`.
3. Find 2 existing components in the repo (search for `extends LitElement`). Match their: folder layout, file naming, tag prefix, import style (`.js` extensions or not), CSS custom property naming, and test style. **Existing conventions beat the defaults in this skill.**
4. Find the shared styles module and design tokens if they exist (e.g. `styles/`, `tokens.css`) and reuse them.
5. If the repo has no components yet, use the default layout below and a tag prefix derived from the package name (ask the user only if it is ambiguous).

## Step 2: Decide the component's contract before coding

Write down (briefly, in your reply or as a JSDoc block) the public surface:

- **Properties** (attribute-backed, primitives) and **properties** (`attribute: false`, objects/arrays/functions)
- **Events** emitted, with detail types
- **Slots** (default and named)
- **CSS custom properties** and **CSS parts**
- **Accessibility**: role, keyboard behavior, labelling

Keep it small. Prefer slots over HTML-through-properties, and events over callback properties.

## Step 3: Generate the files

Default layout (use the repo's layout instead if it differs):

```
src/components/<name>/
├── <name>.ts           # the component
├── <name>.styles.ts    # styles (only if > ~40 lines or shared)
├── <name>.test.ts      # tests
└── index.ts            # re-export
```

Also update the package's barrel file (`src/index.ts`) if one exists.

### Naming rules

- Tag: `<prefix>-<name>`, lowercase kebab-case, always hyphenated (e.g. `acme-card`).
- Class: PascalCase of the tag (`AcmeCard`).
- Events: `<prefix>-<verb>` kebab-case (`acme-select`). Never reuse native event names for custom semantics.
- Private members: `_underscorePrefixed`.
- CSS custom properties: `--<prefix>-<name>-<thing>` (e.g. `--acme-card-padding`).

### Component template

```ts
import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from './acme-card.styles.js';

export type AcmeCardVariant = 'flat' | 'raised';

export interface AcmeCardSelectDetail {
  id: string;
}
export type AcmeCardSelectEvent = CustomEvent<AcmeCardSelectDetail>;

/**
 * Short one-line description of the component.
 *
 * @slot - Default slot for card content.
 * @slot header - Optional header content.
 * @fires acme-select - Fired when the card is activated. Detail: `{ id: string }`.
 * @csspart container - The card wrapper.
 * @cssprop [--acme-card-padding=1rem] - Inner padding.
 * @cssprop [--acme-card-radius=0.5rem] - Corner radius.
 */
@customElement('acme-card')
export class AcmeCard extends LitElement {
  static override styles = styles;

  /** Visual style of the card. */
  @property({ reflect: true }) variant: AcmeCardVariant = 'flat';

  /** Identifier included in the `acme-select` event detail. */
  @property() cardId = '';

  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private _hasHeader = false;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('disabled') && this.disabled) {
      this.removeAttribute('tabindex');
    }
  }

  protected override render(): TemplateResult {
    return html`
      <div
        part="container"
        class=${classMap({ container: true, raised: this.variant === 'raised' })}
        @click=${this._onActivate}
      >
        ${this._hasHeader ? html`<header><slot name="header"></slot></header>` : nothing}
        <slot></slot>
      </div>
    `;
  }

  private _onActivate(): void {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent<AcmeCardSelectDetail>('acme-select', {
        detail: { id: this.cardId },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'acme-card': AcmeCard;
  }
  interface HTMLElementEventMap {
    'acme-select': AcmeCardSelectEvent;
  }
}
```

### Styles template (`*.styles.ts`)

```ts
import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    --_padding: var(--acme-card-padding, 1rem);
    --_radius: var(--acme-card-radius, 0.5rem);
  }
  :host([hidden]) {
    display: none;
  }
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }
  .container {
    padding: var(--_padding);
    border-radius: var(--_radius);
    border: 1px solid var(--acme-border-color, #d4d4d8);
  }
  .raised {
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.12);
  }
  @media (prefers-reduced-motion: no-preference) {
    .container {
      transition: box-shadow 150ms ease;
    }
  }
`;
```

### Test template (`*.test.ts`)

Use the repo's existing runner. Default is `@open-wc/testing` + Web Test Runner:

```ts
import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './acme-card.js';
import type { AcmeCard, AcmeCardSelectEvent } from './acme-card.js';

describe('acme-card', () => {
  it('renders slotted content', async () => {
    const el = await fixture<AcmeCard>(html`<acme-card>Hello</acme-card>`);
    expect(el).lightDom.to.equal('Hello');
  });

  it('reflects the variant attribute', async () => {
    const el = await fixture<AcmeCard>(html`<acme-card variant="raised"></acme-card>`);
    expect(el.getAttribute('variant')).to.equal('raised');
  });

  it('fires acme-select with the card id', async () => {
    const el = await fixture<AcmeCard>(html`<acme-card card-id="a1"></acme-card>`);
    setTimeout(() => el.shadowRoot!.querySelector<HTMLElement>('.container')!.click());
    const ev = (await oneEvent(el, 'acme-select')) as AcmeCardSelectEvent;
    expect(ev.detail.id).to.equal('a1');
  });

  it('does not fire when disabled', async () => {
    const el = await fixture<AcmeCard>(html`<acme-card disabled></acme-card>`);
    let fired = false;
    el.addEventListener('acme-select', () => (fired = true));
    el.shadowRoot!.querySelector<HTMLElement>('.container')!.click();
    expect(fired).to.equal(false);
  });

  it('passes axe accessibility checks', async () => {
    const el = await fixture<AcmeCard>(html`<acme-card>Content</acme-card>`);
    await expect(el).shadowDom.to.be.accessible();
  });
});
```

Notes: `await el.updateComplete` after changing properties before asserting on DOM. In the first test above, the `attribute` name for `cardId` is `cardid` by default; add `{ attribute: 'card-id' }` to the decorator if kebab-case attributes are wanted, and keep the test consistent with that.

### Index template

```ts
export { AcmeCard } from './acme-card.js';
export type { AcmeCardVariant, AcmeCardSelectDetail, AcmeCardSelectEvent } from './acme-card.js';
```

## Step 4: Hard rules for generated code

**Types and config**
- No `any`. Use `unknown` and narrow.
- `override` on every overridden member; lifecycle methods are `protected override`.
- Use `PropertyValues<this>`, never bare `PropertyValues`.
- Always add the `HTMLElementTagNameMap` entry, and a `HTMLElementEventMap` entry for each custom event.
- Export prop, detail, and event types so consumers can import them.

**Properties**
- Every property has a type and a default value.
- Objects, arrays, and functions use `{ attribute: false }`. Non-string primitives declare `type: Boolean | Number`.
- `reflect: true` only when CSS selectors need the attribute.
- Never mutate arrays/objects in place; reassign (`this.items = [...this.items, x]`).
- `@state` for internal reactive data; plain private fields for non-reactive data.
- Do not store derived values; compute them in `willUpdate` or `render`.

**Rendering**
- `render()` is pure: no writes, no side effects, no fetching.
- Use `@event=${handler}` bindings; never manual `addEventListener` on template elements.
- Use `.prop=`, `?bool=`, `ifDefined`, `classMap`, `styleMap`, `repeat` (keyed), `when`.
- No string-built HTML. No `unsafeHTML` without sanitization.

**Lifecycle**
- Global listeners/observers added in `connectedCallback` are removed in `disconnectedCallback`; always call `super`.
- Browser-only APIs (`window`, `document`, `matchMedia`, `localStorage`) never run in constructors, field initializers, or `render()`, so the component stays SSR-safe.
- Reusable logic goes in a `ReactiveController`, not copy-pasted across components.

**Events**
- `CustomEvent<Detail>` with a typed detail; kebab-case, prefixed names.
- `bubbles` and `composed` only when the event must cross shadow boundaries.

**Styling**
- Styles in `static override styles = css\`...\``; never inline `<style>` in templates.
- Style `:host` (`display`) and `:host([hidden])`.
- Theming via CSS custom properties with fallbacks, `part` attributes, and slots. Document each with `@cssprop`, `@csspart`, `@slot`.
- Honor `prefers-reduced-motion`.

**Accessibility**
- Prefer native elements (`button`, `a`, `input`) inside the shadow root.
- Custom widgets need correct `role`, `aria-*`, keyboard handling, and visible `:focus-visible` styles.
- Composite widgets use `delegatesFocus: true` in `shadowRootOptions`.
- Form controls: `static formAssociated = true` with `ElementInternals`.
- ARIA ID references do not cross shadow roots; use `aria-label` or internals.

## Step 5: Patterns for specific component kinds

- **Form control:** `formAssociated`, `value` property, `name`, `disabled`, `required`, `setFormValue`, `setValidity`, dispatch `input` and `change` (composed, bubbling) to match native semantics.
- **Modal/dialog:** wrap native `<dialog>`; manage focus return on close; close on Escape; expose `open` (reflected) and `acme-close` event.
- **List/collection:** accept `items` with `attribute: false`; render with keyed `repeat`; emit selection events; do not fetch inside the component unless asked, and if so use `@lit/task` with `AbortSignal`.
- **Async data:** `@lit/task`, always forwarding `signal`, with pending/complete/error rendered.
- **Cross-cutting config (theme, locale):** `@lit/context` with a `Symbol`-keyed, typed context.
- **Slideshow/carousel:** lazy-load offscreen images (`loading="lazy"`, `decoding="async"`), set explicit `width`/`height` to avoid layout shift, clean up timers in `disconnectedCallback`, pause autoplay on `prefers-reduced-motion` and on hover/focus.

## Step 6: Framework export notes (only when the repo targets frameworks)

- **React:** generate a typed wrapper with `@lit/react` `createComponent`, mapping each custom event to an `onX` prop.
- **Astro / Next.js / WordPress blocks:** treat the output as a plain custom element. Pass primitives via attributes, complex data via properties set from a script or a `<script type="application/json">`. Import the module client-side only where needed. Never rely on constructor-time DOM access.
- Avoid double registration across bundles when the component can be loaded twice: guard with `customElements.get(tag)`.

## Step 7: Verify before replying

Run what exists in the repo, in this order, and fix failures:

1. Type check (`tsc --noEmit` or the repo's script)
2. Lint (`eslint`/`biome`, whichever is configured)
3. The new test file

Then reply with:
- The list of files created or changed
- The component's public contract (properties, events, slots, parts, CSS properties) as a short table
- A one-line usage example in HTML
- Anything you assumed, and anything you could not verify

## Review checklist

- [ ] Matches existing repo conventions (naming, folders, imports)
- [ ] Tag is namespaced and present in `HTMLElementTagNameMap`
- [ ] Events typed and registered in `HTMLElementEventMap`
- [ ] Properties typed, defaulted, with correct `type`/`attribute`/`reflect`
- [ ] No in-place mutation; `render()` pure
- [ ] Listeners cleaned up; no browser-only APIs on the SSR path
- [ ] Styling hooks documented (`@slot`, `@csspart`, `@cssprop`)
- [ ] Keyboard accessible, labelled, visible focus
- [ ] Tests cover render, properties, events, disabled state, and accessibility
- [ ] Type check, lint, and tests pass