## 2024-07-16 - Make custom tabs/buttons keyboard accessible
**Learning:** Custom interactive elements (like `<li>` acting as tabs for the script terminal) are inaccessible to keyboard users by default. Without `tabindex` and semantic roles, screen readers won't announce them correctly, and keyboard users cannot trigger them.
**Action:** When using non-interactive elements (`div`, `span`, `li`) as controls, always add `tabindex="0"`, `role="button"` (or appropriate role), attach keydown event listeners for `Enter` and `Space`, and ensure visible `focus-visible` styles.

## 2024-07-23 - Make form inputs and read-only text fields accessible
**Learning:** Custom UI inputs and read-only fields within interactive "terminal-like" web applications lack inherent accessible names if they are not explicitly paired with `<label>` elements or given an ARIA label. Screen readers won't announce what the input field is for, confusing users who rely on assistive technology.
**Action:** When creating custom tool interfaces without traditional label elements, always add an explicit `aria-label` attribute directly to the `<input>` element (e.g., `aria-label="Terminal command input"`, `aria-label="Generated password"`). Also ensure decorative icons include `aria-hidden="true"`.
## 2024-11-20 - Custom GUI Elements Missing Focus States
**Learning:** Interactive UI components that are custom-built (like the custom tabs and buttons in the DevOps Tools section) often miss default browser focus outlines because developers explicitly set `border: none` or override them for aesthetics. Screen reader and keyboard users can't visually determine which element has focus.
**Action:** When building or auditing custom interactive components (like `.gui-tab` or custom tools buttons), always verify that they have an explicit `:focus-visible` state defined that provides clear visual feedback (using `outline` or `box-shadow`) inheriting the site's primary interactive color.
