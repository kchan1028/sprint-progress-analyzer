# Accessibility checks

Reviewed November 13, 2026. The checks are reproducible in `e2e/sprint.spec.ts` with `npm run test:e2e`.

## Coverage

- Chromium at desktop and Pixel 5 emulated phone dimensions; phone emulation is not a test on physical Android hardware.
- Homepage, demo dashboard, and open import form, in both light and dark themes.
- Imported CSV after correcting a status mapping.
- Keyboard skip link into dashboard content, activating a filter with Enter, and selected filter state through `aria-pressed`.
- Document-level horizontal overflow checks. Wide issue tables scroll inside focusable, named regions.
- axe automated scans without disabled rules or excluded page regions.

## Fixes made from the findings

The review found insufficient contrast in secondary text, links, warning chips, and some dark-theme status combinations. Theme tokens were adjusted, and the deleted workflow column no longer reduces text contrast through opacity. The dashboard now has a level-one sprint heading and a main landmark. Ticket lists and table regions support keyboard focus and scrolling. Import mapping selects have accessible names, and success/error messages use status/alert roles.

The open import form also overflowed a phone-width viewport. Its fields now stack on small screens, and action buttons wrap. Existing focus outlines remain in place.

## Limits

Passing axe is not a WCAG conformance claim. This review does not establish screen-reader usability, voice-control behavior, physical-device support, full zoom/reflow behavior, or the clarity of every dynamic announcement. Keyboard assertions cover representative paths rather than every interactive element. Firefox, Safari/WebKit, and assistive-technology testing remain useful next steps.
