import {acts} from './acts.mjs';

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function drawRoute(route) {
  const chart = node('article', '', 'act-route card');
  chart.append(node('h3', route.title));
  const steps = node('ol', '', 'act-steps');
  for (const check of route.checks) {
    const step = node('li', '', 'act-step');
    const question = node('div', '', 'act-question');
    question.append(node('small', check.section), node('p', check.question));
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
  chart.append(steps, outcome);
  return chart;
}

export function setupLegislationFlowcharts() {
  const select = document.getElementById('flowchart-act');
  const source = document.getElementById('flowchart-source');
  const title = document.getElementById('flowchart-title');
  const note = document.getElementById('flowchart-note');
  const routes = document.getElementById('flowchart-routes');
  const status = document.getElementById('flowchart-status');

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
    routes.replaceChildren(...act.routes.map(drawRoute));
    status.textContent = 'Showing ' + act.title + ' · ' + act.routes.length + (act.routes.length === 1 ? ' pathway' : ' pathways');
  }

  select.addEventListener('change', () => {
    show(select.value);
    history.replaceState(history.state, '', '#legislation/' + select.value);
  });
  return id => show(id || select.value);
}
