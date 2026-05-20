# Quote Reload Fix Tasks

## Goal
Ensure saved quotes always reload correctly from the Tool page, even with legacy persisted data.

## Tasks
- [x] Reproduce and isolate quote reload failure path
- [x] Add unique-quote normalization in project store migration
- [x] Make quote selection robust against legacy duplicate ids
- [x] Add regression test for duplicate-id quote reload
- [x] Run build and tests
- [x] Update result notes

## Results
- Root cause: quote activation matched only by `quote.id`; legacy duplicate ids made some saved quotes not reload or always load the first duplicate.
- Fix: `setActiveQuote` now accepts optional `generatedAt` and stores `activeQuoteGeneratedAt` to disambiguate exact snapshots.
- Fix: sidebar passes `(quote.id, quote.generatedAt)` on click and active styling checks both values when available.
- Hardening: migration now normalizes duplicate quote ids to unique ids with a deterministic suffix.
- Regression test added for duplicate-id activation.
- Validation passed: `npm test -- --run`, `npm run build`.
