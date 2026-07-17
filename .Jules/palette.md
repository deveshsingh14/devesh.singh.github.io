## 2024-07-16 - Make custom tabs/buttons keyboard accessible
**Learning:** Custom interactive elements (like `<li>` acting as tabs for the script terminal) are inaccessible to keyboard users by default. Without `tabindex` and semantic roles, screen readers won't announce them correctly, and keyboard users cannot trigger them.
**Action:** When using non-interactive elements (`div`, `span`, `li`) as controls, always add `tabindex="0"`, `role="button"` (or appropriate role), attach keydown event listeners for `Enter` and `Space`, and ensure visible `focus-visible` styles.
