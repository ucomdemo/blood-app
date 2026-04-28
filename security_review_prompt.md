# Security Review Checklist for Blood Pressure App

Use this checklist when reviewing or submitting changes to this repository.

## Input Validation

- [ ] All numeric inputs have both `min` and `max` HTML attributes set to realistic clinical ranges.
  - Systolic blood pressure: 60 – 250 mmHg
  - Diastolic blood pressure: 40 – 150 mmHg
  - Pulse: 30 – 220 bpm
- [ ] Server-side (JavaScript) validation mirrors the HTML constraints and rejects out-of-range values.
- [ ] Free-text fields (e.g. notes) have a `maxlength` attribute to prevent oversized payloads.
- [ ] Select/dropdown values are validated against the known allow-list before being stored.

## Cross-Site Scripting (XSS) Prevention

- [ ] Dynamic content is inserted via `textContent` (or equivalent DOM APIs), **never** `innerHTML`/`outerHTML` with untrusted data.
- [ ] A Content Security Policy (CSP) `<meta>` tag is present and restricts scripts, styles, and other resources to `'self'`.
- [ ] No use of `eval()`, `new Function()`, or `setTimeout(string)`.

## Storage Security

- [ ] Data read back from `localStorage` or `sessionStorage` is validated/sanitised before use (e.g. theme value must be exactly `"dark"` or `"light"`).
- [ ] Sensitive health data is not persisted to `localStorage` without explicit user consent and appropriate warnings.

## Third-Party Resources

- [ ] No external scripts, stylesheets, or fonts are loaded without a Subresource Integrity (SRI) hash.
- [ ] All external origins are explicitly listed in the CSP.

## General

- [ ] No secrets, API keys, or credentials are committed to the repository.
- [ ] Dependencies are kept up-to-date and checked for known vulnerabilities.
- [ ] Inline event handlers (`onclick`, `onload`, etc.) are avoided in favour of `addEventListener`.
