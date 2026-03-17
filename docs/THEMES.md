# Theming with design tokens

All visual theme values live as CSS variables in `app/globals.css` under `:root`. The UI uses these tokens so changing a theme is a matter of overriding the variables.

## Token list

| Token | Purpose | Default (production) |
|-------|---------|----------------------|
| `--bg-page` | Main page background | `#f1f5f9` |
| `--bg-sidebar` | Sidebar background | `#e2e8f0` |
| `--bg-surface` | Cards, list rows, secondary panels | `#f8fafc` |
| `--bg-card` | Primary content panels, header | `#ffffff` |
| `--bg-input` | Inputs, selects, table header | `#f1f5f9` |
| `--text-primary` | Headings, primary text | `#1e293b` |
| `--text-secondary` | Body text | `#475569` |
| `--text-muted` | Captions, hints | `#64748b` |
| `--theme-50` | Light theme tint (focus ring, hover) | `#f0fdfa` |
| `--theme-100` | Theme fill (active nav, selected row) | `#ccfbf1` |
| `--theme-500` | Primary accent (links, buttons) | `#14b8a6` |
| `--theme-600` | Accent hover | `#0d9488` |
| `--border-light` | Dividers, subtle borders | `#e2e8f0` |
| `--border-medium` | Input borders | `#cbd5e0` |
| `--accent` | Alias for `--theme-500` | (same) |
| `--accent-hover` | Alias for `--theme-600` | (same) |
| `--success` | Success state (e.g. status dot) | `#48bb78` |
| `--error` | Error state | `#f56565` |
| `--warning` | Warning state | `#ecc94b` |
| `--shadow-sm` | Small elevation | `0 1px 2px rgba(0,0,0,0.05)` |
| `--shadow-md` | Card/table shadow | `0 1px 3px rgba(0,0,0,0.06)` |
| `--shadow-lg` | Dropdown, panel shadow | `0 4px 12px rgba(0,0,0,0.08)` |
| `--radius-sm` | Small radius | `6px` |
| `--radius-md` | Medium (inputs, buttons) | `8px` |
| `--radius-lg` | Large (cards, tables) | `12px` |

## Adding a second theme

1. **Option A: data attribute on `<html>`**

   In `app/layout.tsx`, you can set `<html data-theme="blue">` (e.g. from a user preference or cookie). Then in `globals.css` add:

   ```css
   [data-theme="blue"] {
     --theme-50: #eff6ff;
     --theme-100: #bfdbfe;
     --theme-500: #2563eb;
     --theme-600: #1d4ed8;
   }
   ```

2. **Option B: class on `<body>`**

   Add a class like `theme-dark` and define:

   ```css
   body.theme-dark {
     --bg-page: #1e293b;
     --bg-sidebar: #334155;
     --bg-surface: #334155;
     --bg-card: #0f172a;
     --bg-input: #1e293b;
     --text-primary: #f1f5f9;
     --text-secondary: #cbd5e1;
     --text-muted: #94a3b8;
     --border-light: #334155;
     --border-medium: #475569;
     --theme-50: #1e3a5f;
     --theme-100: #1e40af;
     --theme-500: #3b82f6;
     --theme-600: #2563eb;
   }
   ```

3. **Option C: swap the default in `:root`**

   To make “blue” or “green” the single theme for the app, change the variable values in `:root` in `globals.css` (and update `<meta name="theme-color">` in `layout.tsx` to match).

## Where tokens are used

- **Layout:** Header, sidebar, main content, and right panel use `--bg-*`, `--border-light`, `--shadow-*`.
- **Interactive:** Buttons and links use `--theme-500` / `--theme-600`; active/selected use `--theme-100`.
- **Forms:** Inputs and selects use `--bg-input`, `--border-medium`; focus uses `--theme-50` / `--theme-500`.
- **Tables:** Background `--bg-card`, header `--bg-input`, borders `--border-light`.
- **Status:** Success/error/warning use `--success`, `--error`, `--warning` (keep these consistent across themes if you want).

Using only these tokens in new components will keep the app ready for multiple themes.
