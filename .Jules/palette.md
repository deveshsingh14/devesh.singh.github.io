## 2024-07-16 - Make custom tabs/buttons keyboard accessible
**Learning:** Custom interactive elements (like `<li>` acting as tabs for the script terminal) are inaccessible to keyboard users by default. Without `tabindex` and semantic roles, screen readers won't announce them correctly, and keyboard users cannot trigger them.
**Action:** When using non-interactive elements (`div`, `span`, `li`) as controls, always add `tabindex="0"`, `role="button"` (or appropriate role), attach keydown event listeners for `Enter` and `Space`, and ensure visible `focus-visible` styles.

## 2024-07-23 - Make form inputs and read-only text fields accessible
**Learning:** Custom UI inputs and read-only fields within interactive "terminal-like" web applications lack inherent accessible names if they are not explicitly paired with `<label>` elements or given an ARIA label. Screen readers won't announce what the input field is for, confusing users who rely on assistive technology.
**Action:** When creating custom tool interfaces without traditional label elements, always add an explicit `aria-label` attribute directly to the `<input>` element (e.g., `aria-label="Terminal command input"`, `aria-label="Generated password"`). Also ensure decorative icons include `aria-hidden="true"`.
## 2024-11-20 - Custom GUI Elements Missing Focus States
**Learning:** Interactive UI components that are custom-built (like the custom tabs and buttons in the DevOps Tools section) often miss default browser focus outlines because developers explicitly set `border: none` or override them for aesthetics. Screen reader and keyboard users can't visually determine which element has focus.
**Action:** When building or auditing custom interactive components (like `.gui-tab` or custom tools buttons), always verify that they have an explicit `:focus-visible` state defined that provides clear visual feedback (using `outline` or `box-shadow`) inheriting the site's primary interactive color.
## 2026-07-22 - Custom Tab Interfaces Need Dynamic ARIA States
**Learning:** When implementing custom tab interfaces (like the password generator tabs), static HTML attributes aren't enough. Screen readers need to know which tab is currently active. The `aria-selected` attribute must be dynamically toggled via JavaScript to accurately reflect the interface state to assistive technologies.
**Action:** Ensure any custom tab or toggle component includes JavaScript logic to explicitly manage `aria-selected` attributes, alongside CSS class changes.
## 2024-05-15 - Dynamic Terminal Accessibility
**Learning:** Simulated terminal outputs that dynamically write lines to the DOM must use `aria-live` (e.g., `aria-live="polite"`) to ensure screen readers announce the incoming text. Without this, visually impaired users miss crucial real-time feedback from the simulated tools.
**Action:** Always verify that elements acting as live console/terminal logs have appropriate `aria-live` attributes added to their parent containers.

## 2024-12-05 - Enhance required field indicators when using sr-only labels
**Learning:** When form fields use `sr-only` classes on their `<label>` elements to hide them visually in favor of a cleaner design, relying on the `required` attribute is insufficient for sighted users. The browser's native required popups only appear *after* a failed submission attempt.
**Action:** When visual labels are hidden and placeholders are used as the primary visual label, explicitly add a required indicator (e.g., ` *`) to the placeholder text itself so users know which fields are mandatory before interacting with the form.
## 2024-07-30 - Prevent native form redirects for asynchronous submissions
**Learning:** Native HTML form submissions default to a page redirect, which interrupts the user's flow and can feel abrupt or disjointed, especially for simple contact forms. A seamless experience requires keeping the user on the same page.
**Action:** When implementing contact or data-entry forms, always intercept the native `submit` event using `e.preventDefault()`, submit the data asynchronously using `fetch`, and provide immediate in-page UI feedback (like loading states and success/error messages).
