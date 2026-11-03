import {
  LitElement,
  html,
  unsafeCSS,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './theme-toggle.css?raw';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'lit-001-theme';
const OPTIONS: readonly ThemePreference[] = ['light', 'dark', 'system'];

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== 'system') {
    return preference;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

/**
 * Segmented control that sets light/dark/system theme on `document.documentElement`
 * via `data-theme` and `color-scheme`, so CSS custom properties reach all shadow roots.
 *
 * @fires theme-change - Fired when the preference changes. Detail: `{ theme, resolved }`.
 */
@customElement('theme-toggle')
export class ThemeToggle extends LitElement {
  static override styles = unsafeCSS(styles);

  /** User preference: explicit light/dark, or follow the OS. */
  @property({ reflect: true })
  theme: ThemePreference = 'system';

  private _media?: MediaQueryList;

  private _onMediaChange = (): void => {
    if (this.theme === 'system') {
      this._publish();
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isThemePreference(stored)) {
      this.theme = stored;
    }
    this._media = window.matchMedia('(prefers-color-scheme: dark)');
    this._media.addEventListener('change', this._onMediaChange);
    this._publish();
  }

  override disconnectedCallback(): void {
    this._media?.removeEventListener('change', this._onMediaChange);
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('theme')) {
      localStorage.setItem(STORAGE_KEY, this.theme);
      this._publish();
    }
  }

  protected override render(): TemplateResult {
    return html`
      <div class="group" role="radiogroup" aria-label="Color theme">
        ${OPTIONS.map(
          (option) => html`
            <button
              type="button"
              role="radio"
              aria-checked=${this.theme === option ? 'true' : 'false'}
              @click=${() => this._select(option)}
            >
              ${option[0]!.toUpperCase()}${option.slice(1)}
            </button>
          `
        )}
      </div>
    `;
  }

  private _select(theme: ThemePreference): void {
    this.theme = theme;
  }

  private _publish(): void {
    const resolved = resolveTheme(this.theme);
    applyResolvedTheme(resolved);
    this.dispatchEvent(
      new CustomEvent<{ theme: ThemePreference; resolved: ResolvedTheme }>(
        'theme-change',
        {
          detail: { theme: this.theme, resolved },
          bubbles: true,
          composed: true,
        }
      )
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'theme-toggle': ThemeToggle;
  }
  interface HTMLElementEventMap {
    'theme-change': CustomEvent<{
      theme: ThemePreference;
      resolved: ResolvedTheme;
    }>;
  }
}
