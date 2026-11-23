# Release Process in Government

Interactive information release guide based on Victorian government rules. Includes a plain-language assessment, a zoomable decision tree, legislation references, and prompts for checking delegations.

The static website files are in this repository’s root. To publish with GitHub Pages, select the `main` branch and `/ (root)` in Settings → Pages.

The guide is a working draft. Legal content was checked on 20 November 2026. Confirm current law and your agency’s delegations before using an outcome for an actual release.

Victorian Data Sharing Act pathways were updated on 23 November 2026. The assessment distinguishes statutory Chief Data Officer requests (including non-identifying data), identifiable-data integration with an eligible data analytics body, and ordinary interagency sharing. It separates policy and service planning from operational delivery, and requires a recorded and checked function, legal authority, and authorised role for the ordinary agency-function route.

Run the assessment and map regression checks with `node --test tests/assessment.test.mjs`.

Assessment answers stay in the browser tab unless copied or downloaded.

The live legislation and framework panel starts every candidate as possible. It shows answer-based exclusions with reasons, keeps unverified conditions open, and treats security, agreements, MARAM, human rights, and recordkeeping separately from disclosure authority. Changing an earlier answer restores affected candidates. The copied or downloaded record includes these assessments and the separate CDO and integration subroutes.

Run all regression checks with `node --test tests/*.test.mjs`.


Department profiles added on 23 November 2026 cover the ten major departments. They distinguish establishment, renaming, ministerial administration of Acts, actual disclosure authority, and delegations. DFFH’s establishment is the s 10 Order in Gazette S 684 (22 December 2020), effective 1 February 2021. AAO 241 is included as a historical transfer instrument, with an explicit warning to check later changes. DPC and DTF profiles identify PROV archival citations, but flag that their original historical instruments have not been independently inspected. The profiles are not an exhaustive historical chain.

The portfolio index is a title-only navigation aid to the signed General Order effective 23 October 2026. It includes all 60 portfolios, including portfolios with no Act titles listed, and preserves separate entries where a title appears under multiple portfolios. Its 815 title entries represent 626 distinct titles. Each links to the source PDF page. The Order’s full scope notes, footnotes, split provisions, and joint administration must be read in that source. Department starting points are navigation suggestions, not a legal allocation of whole Acts to a department. The index does not evaluate disclosure powers under all those Acts.

Changing the assessment department restarts the questionnaire and clears its authority record. Browsing another department in the authority view does not change assessment answers. Editing an underlying authority invalidates its checked status and any later approval. This tool records the responsible team’s authority check, rather than verifying internal instruments itself.

Source data lives in `department-data.mjs` and `portfolio-legislation.mjs`. To maintain the title index, extract the signed PDF into ordered `{n, page, text}` records in a temporary `general-order-lines.json`, with zero-based sequential `n` and one-based PDF pages, then run `python3 scripts/build-legislation-index.py`. Review wrapped titles and compare source pages before committing. Do not infer department powers from the title index.
