import {acts} from './acts.mjs?v=2';
import {provisionsFor} from './provisions.mjs?v=2';

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function drawRoute(route, openProvisions) {
  const chart = node('article', '', 'act-route');
  chart.append(node('h3', route.title));
  const steps = node('ol', '', 'act-steps');
  for (const check of route.checks) {
    const step = node('li', '', 'act-step');
    const question = node('div', '', 'act-question');
    const decision = node('button', '', 'act-decision');
    decision.type = 'button';
    decision.setAttribute('aria-haspopup', 'dialog');
    decision.append(node('span', check.question, 'act-question-text'));
    const meta = node('span', '', 'act-decision-meta');
    meta.append(node('span', check.section), node('span', 'View provisions ↗', 'act-provision-cue'));
    decision.append(meta);
    decision.addEventListener('click', () => openProvisions(check));
    question.append(decision);
    if (check.alternatives) {
      const options = node('ul');
      for (const alternative of check.alternatives) options.append(node('li', alternative));
      question.append(options);
    }
    const no = node('div', '', 'act-no');
    no.append(node('span', 'No or unclear', 'act-branch-label'), node('p', check.otherwise));
    const yes = node('span', 'Yes', 'act-yes');
    step.append(question, no, yes);
    steps.append(step);
  }
  const outcome = node('div', '', 'act-outcome');
  outcome.append(node('strong', route.outcome), node('p', route.detail));
  const outcomeRow = node('div', '', 'act-outcome-row');
  outcomeRow.append(outcome);
  chart.append(steps, outcomeRow);
  return chart;
}

function createProvisionReader() {
  const dialog = document.getElementById('flowchart-provisions');
  const law = document.getElementById('provision-dialog-law');
  const question = document.getElementById('provision-dialog-question');
  const list = document.getElementById('provision-dialog-list');

  return (actId, check) => {
    law.textContent = acts[actId].title;
    question.textContent = check.question;
    const entries = provisionsFor(actId, check.section).map(({citation, note, quote, href}) => {
      const entry = node('section', '', 'act-provision-entry');
      const title = node('h3', citation);
      if (quote) entry.append(title, node('blockquote', '“' + quote + '”'));
      else entry.append(title);
      const link = node('a', 'Read ' + citation + ' in the source ↗');
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener';
      entry.append(node('p', note), link);
      return entry;
    });
    list.replaceChildren(...entries);
    dialog.showModal();
    dialog.querySelector('.act-provision-body').scrollTop = 0;
  };
}

export function setupLegislationFlowcharts() {
  const select = document.getElementById('flowchart-act');
  const source = document.getElementById('flowchart-source');
  const title = document.getElementById('flowchart-title');
  const note = document.getElementById('flowchart-note');
  const routes = document.getElementById('flowchart-routes');
  const status = document.getElementById('flowchart-status');
  const openProvisionReader = createProvisionReader();

  const entries = Object.entries(acts);
  const ordered = entries.slice(1).sort(([, a], [, b]) => a.title.localeCompare(b.title, 'en-AU'));
  for (const [id, act] of [entries[0], ...ordered]) select.add(new Option(act.title, id));

  function show(id) {
    const selected = Object.hasOwn(acts, id) ? id : 'vds';
    const act = acts[selected];
    select.value = selected;
    title.textContent = act.title;
    note.textContent = act.note;
    source.href = act.source;
    routes.replaceChildren(...act.routes.map(route => drawRoute(route, check => openProvisionReader(selected, check))));
    status.textContent = 'Showing ' + act.title + ' · ' + act.routes.length + (act.routes.length === 1 ? ' pathway' : ' pathways');
  }

  select.addEventListener('change', () => {
    show(select.value);
    history.replaceState(history.state, '', '#legislation/' + select.value);
  });
  return id => show(id || select.value);
}
