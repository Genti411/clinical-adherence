# PROM Licensing and Usage

## Included instrument

`DAILY_FUNCTION` (`daily-function-v1`) is an **original, non-proprietary** scale
created for this project. It is not a named or validated clinical instrument. It
may be used freely.

## Adding a validated instrument

Many validated PROMs (e.g. KOOS, DASH, PROMIS, Oxford scores) are copyrighted by
their authors or institutions. Before adding one:

1. Obtain the licence for the instrument (many are free for non-commercial use;
   commercial use typically requires a formal agreement).
2. Confirm scoring rules are included in the licence.
3. Add a new `PromInstrument` constant in `src/lib/proms.ts` with the licensed
   questions and scoring logic, and cite the source and licence in a comment.
4. Do not ship a licensed instrument in an open-source repository unless the
   licence explicitly permits it.

## References

- PROMIS: https://www.healthmeasures.net/explore-measurement-systems/promis
- KOOS: http://www.koos.nu
- DASH: https://www.dash.iwh.on.ca
