# Release Process in Government

Interactive information release guide based on Victorian government rules. Includes a plain-language assessment, a zoomable decision tree, legislation references, and prompts for checking delegations.

The static website files are in this repository’s root. To publish with GitHub Pages, select the `main` branch and `/ (root)` in Settings → Pages.

The guide is a working draft. Legal content was checked on 20 November 2026. Confirm current law and your agency’s delegations before using an outcome for an actual release.

Victorian Data Sharing Act pathways were updated on 23 November 2026. The assessment distinguishes statutory Chief Data Officer requests (including non-identifying data), identifiable-data integration with an eligible data analytics body, and ordinary interagency sharing. It separates policy and service planning from operational delivery, and labels the ordinary agency-function basis as provisional pending confirmation.

Run the assessment and map regression checks with `node --test tests/assessment.test.mjs`.

Assessment answers stay in the browser tab unless copied or downloaded.

The live legislation and framework panel starts every candidate as possible. It shows answer-based exclusions with reasons, keeps unverified conditions open, and treats security, agreements, MARAM, human rights, and recordkeeping separately from disclosure authority. Changing an earlier answer restores affected candidates. The copied or downloaded record includes these assessments and the separate CDO and integration subroutes.

Run all regression checks with `node --test tests/*.test.mjs`.

