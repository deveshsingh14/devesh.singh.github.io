## 2024-07-16 - Make custom tabs/buttons keyboard accessible
**Learning:** Custom interactive elements (like `<li>` acting as tabs for the script terminal) are inaccessible to keyboard users by default. Without `tabindex` and semantic roles, screen readers won't announce them correctly, and keyboard users cannot trigger them.
**Action:** When using non-interactive elements (`div`, `span`, `li`) as controls, always add `tabindex="0"`, `role="button"` (or appropriate role), attach keydown event listeners for `Enter` and `Space`, and ensure visible `focus-visible` styles.
## 2026-07-19 - Adding explicit labels to GUI inputs
**Learning:** Interactive UI elements that use text visually for context still need programmatic association (like 'for' attributes matching 'id's) or 'aria-labels' (for icon/terminal inputs) for screen readers to properly announce them.
**Action:** Always ensure inputs have associated labels or aria-labels, even if visual context seems sufficient.
