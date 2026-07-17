## 2024-07-16 - Make custom tabs/buttons keyboard accessible
**Learning:** Custom interactive elements (like `<li>` acting as tabs for the script terminal) are inaccessible to keyboard users by default. Without `tabindex` and semantic roles, screen readers won't announce them correctly, and keyboard users cannot trigger them.
**Action:** When using non-interactive elements (`div`, `span`, `li`) as controls, always add `tabindex="0"`, `role="button"` (or appropriate role), attach keydown event listeners for `Enter` and `Space`, and ensure visible `focus-visible` styles.

## 2024-07-23 - Make form inputs and read-only text fields accessible
**Learning:** Custom UI inputs and read-only fields within interactive "terminal-like" web applications lack inherent accessible names if they are not explicitly paired with `<label>` elements or given an ARIA label. Screen readers won't announce what the input field is for, confusing users who rely on assistive technology.
**Action:** When creating custom tool interfaces without traditional label elements, always add an explicit `aria-label` attribute directly to the `<input>` element (e.g., `aria-label="Terminal command input"`, `aria-label="Generated password"`). Also ensure decorative icons include `aria-hidden="true"`.
