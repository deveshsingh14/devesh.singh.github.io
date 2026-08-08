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
## 2026-08-01 - Dynamic Text Accessibility
**Learning:** Dynamic text effects like typewriters are extremely confusing for screen readers due to the character-by-character updates. A common pattern is to hide the animation with `aria-hidden` and provide the static, complete text in an `.sr-only` class block alongside it.
**Action:** When implementing visual text animations, always duplicate the final meaning in a visually hidden block for screen readers.

## 2024-08-05 - Enhance dynamic inline text announcements for screen readers
**Learning:** Buttons that execute an action and immediately provide inline text feedback (e.g., changing from "Send" to "Sending..." or "Copy" to "Copied!") are not announced by screen readers if their text is updated dynamically via JavaScript. This leaves visually impaired users unaware of the state change or successful action completion.
**Action:** When a button's text is modified dynamically for inline user feedback, always ensure the button (or its parent text container) has `aria-live="polite"` applied so screen readers announce the state change correctly without interrupting the user.

## 2024-05-20 - Auto-select Text in Read-Only Fields
**Learning:** Users often click read-only output fields (like generated passwords) with the intention of copying them. Providing a one-click auto-select using `HTMLInputElement.select()` significantly reduces friction and delights users.
**Action:** Apply this pattern to any read-only text output fields where the primary user intent is to copy the data.

## 2026-08-05 - Focus States for Custom GUI Elements
**Learning:** Custom styled form elements (like sliders and inputs) often lose default browser focus outlines, significantly harming keyboard navigation and accessibility if not explicitly restored.
**Action:** Ensure all interactive elements, particularly custom , , and checkboxes, have explicit `:focus-visible` styles that maintain sufficient contrast.

## 2026-08-05 - Focus States for Custom GUI Elements
**Learning:** Custom styled form elements (like sliders and inputs) often lose default browser focus outlines, significantly harming keyboard navigation and accessibility if not explicitly restored.
**Action:** Ensure all interactive elements, particularly custom `.gui-input`, `.gui-slider`, and checkboxes, have explicit `:focus-visible` styles that maintain sufficient contrast.

## $(date +%Y-%m-%d) - Interactive custom upload areas
**Learning:** Custom 'drag and drop' or 'click to select' file upload zones built out of `div` elements are entirely inaccessible to keyboard users unless explicitly configured. They must be operable via `Enter` or `Space` keys to replicate native button behavior.
**Action:** When a div acts as an interactive trigger (like an upload area), assign it `role="button"`, `tabindex="0"`, a descriptive `aria-label`, visible `:focus-visible` styles, and JavaScript keydown listeners for `Enter` and `Space`.

## 2024-05-10 - In-page anchor link target focus
**Learning:** When using in-page anchor links (like `#about` or a skip-to-content link), navigating to them visually scrolls the page, but many browsers fail to move keyboard focus to the target element unless the element is explicitly focusable. This traps screen reader and keyboard users at the top of the page.
**Action:** Always add `tabindex="-1"` to destination containers (like `<section id="...">` or `<main id="...">`) to allow them to receive programmatic focus, and use CSS (`:focus { outline: none; }`) to suppress unwanted visible outlines when they do.
