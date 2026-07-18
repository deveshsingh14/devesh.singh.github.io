## 2024-07-16 - Make custom tabs/buttons keyboard accessible
**Learning:** Custom interactive elements (like `<li>` acting as tabs for the script terminal) are inaccessible to keyboard users by default. Without `tabindex` and semantic roles, screen readers won't announce them correctly, and keyboard users cannot trigger them.
**Action:** When using non-interactive elements (`div`, `span`, `li`) as controls, always add `tabindex="0"`, `role="button"` (or appropriate role), attach keydown event listeners for `Enter` and `Space`, and ensure visible `focus-visible` styles.

## 2024-07-18 - Associate form controls with labels and accessible names
**Learning:** Form inputs like sliders, text fields, and standalone inputs lack context for screen readers when they are missing explicit label associations or `aria-label` attributes. Visual placement is not enough.
**Action:** Always link text `<label>` elements to their corresponding `<input>` using the `for` and `id` attributes. If an input is standalone (like a terminal prompt or a result field) and lacks a visible label, always use `aria-label` to describe its purpose.
