import graph from './question-map-data.mjs?v=20261123-departments';
import {getStep, nextStep} from './assessment.mjs?v=20261123-departments';

const get=id=>document.getElementById(id);
const byId=new Map(graph.nodes.map(node=>[node.id,node]));
const outgoing=new Map();
for(const edge of graph.edges) {
  if(!outgoing.has(edge.from))outgoing.set(edge.from,[]);
  outgoing.get(edge.from).push(edge);
}
const make=(tag,css,text)=>{
  const n=document.createElement(tag);
  if(css)n.className=css;
  if(text!=null)n.textContent=text;
  return n;
};
function button(text,classes,click){
  const n=make('button',classes,text); n.type='button'; n.addEventListener('click',click); return n;
}
const qTitle=id=>byId.get(id)?.title??'Assessment outcome';
const svgNS='http://www.w3.org/2000/svg';
const svg=(tag,attrs={})=>{
  const n=document.createElementNS(svgNS,tag);
  for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);
  return n;
};
const key=(from,to)=>from+'\u001F'+to;

export function hasQuestionNode(id){return byId.has(id);}
export function questionMapTitle(id){return qTitle(id);}

export function drawLivePath({trail,current,answers,selection,outcome}) {
  frameForInline={trail,current,answers,selection,outcome};
  if(inlineActive) renderInline();
  const panel=get('live-path');
  panel.replaceChildren();
  get('open-current-tree').href='#tree/'+encodeURIComponent(current);
  if(trail.length>2) panel.append(make('p','path-earlier',`${trail.length-2} earlier answer${trail.length>3?'s':''} in Review answers`));
  if(!trail.length) {
    const begin=make('div','path-node path-complete');
    begin.append(make('small',null,'Start'),make('strong',null,'Proposed release'));
    panel.append(begin,make('div','path-route','Begin assessment'));
  }
  for(const entry of trail.slice(-2)) {
    const node=make('div','path-node path-complete');
    node.append(make('small',null,'Answered'),make('strong',null,qTitle(entry.step)));
    panel.append(node,make('div','path-route',entry.label));
  }
  const active=make('div','path-node path-current');
  active.append(make('small',null,outcome?'Outcome':'Current question'),make('strong',null,outcome?.title??qTitle(current)));
  active.setAttribute('aria-current','step');
  panel.append(active);
  const question=getStep(current,answers);
  if(!question) return;
  const choices=question.options;
  const list=make('ul','path-options');
  const showing=selection?choices.filter(answer=>answer.value===selection):choices;
  for(const option of showing) {
    const next=nextStep(current,option.value,answers);
    const li=make('li',selection?'path-option-preview':null);
    li.append(make('strong',null,option.label),make('span',null,qTitle(next)));
    list.append(li);
  }
  panel.append(make('p','path-next-heading',selection?'Next if you continue':'Possible next branches'),list);
}


let inlineActive=false, frameForInline=null, inlineSvg=null, inlineDrag=null, inlineQuestion=null;
let inlineCenter={x:0,y:0}, inlineWidth=680;
const inlineNodes=new Map(), inlineEdges=new Map();

function linesForMap(value, cap=28) {
  const lines=[];
  let line='';
  for(const word of value.split(' ')){
    if(line&&line.length+word.length+1>cap){lines.push(line);line=word;}
    else line+=(line?' ':'')+word;
  }
  if(line)lines.push(line);
  return lines.length>3?[...lines.slice(0,2),lines[2].slice(0,cap-1)+'…']:lines;
}
function buildInline() {
  if(inlineSvg)return;
  inlineSvg=svg('svg',{role:'img','aria-labelledby':'inline-map-title',class:'inline-question-map'});
  inlineSvg.append(svg('title',{id:'inline-map-title'}));
  const edgeLayer=svg('g');
  for(const edge of graph.edges){
    const line=svg('polyline',{class:'decision-edge',points:edge.points.map(p=>p.join(',')).join(' ')});
    inlineEdges.set(key(edge.from,edge.to),line);
    edgeLayer.append(line);
  }
  inlineSvg.append(edgeLayer);
  for(const node of graph.nodes){
    const group=svg('g',{class:node.type==='outcome'?'inline-outcome':'inline-node'});
    group.append(svg('rect',{x:node.x,y:node.y,width:node.w,height:node.h,rx:9}));
    const label=svg('text',{x:node.x+13,y:node.y+21,class:'inline-node-stage'});
    label.textContent=node.stage;
    group.append(label);
    for(const [i,line] of linesForMap(node.title).entries()){
      const text=svg('text',{x:node.x+13,y:node.y+43+i*17,class:'inline-node-text'});
      text.textContent=line;
      group.append(text);
    }
    inlineNodes.set(node.id,group);
    inlineSvg.append(group);
  }
  get('live-map-viewport').append(inlineSvg);
  inlineSvg.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    inlineDrag={id:e.pointerId,x:e.clientX,y:e.clientY};
    inlineSvg.setPointerCapture(e.pointerId);
  });
  inlineSvg.addEventListener('pointermove',e=>{
    if(inlineDrag?.id!==e.pointerId)return;
    const ratio=inlineWidth/inlineSvg.clientWidth;
    inlineCenter.x-=(e.clientX-inlineDrag.x)*ratio;
    inlineCenter.y-=(e.clientY-inlineDrag.y)*ratio;
    inlineDrag={id:e.pointerId,x:e.clientX,y:e.clientY};
    inlineTransform();
  });
  const stop=e=>{if(inlineDrag?.id===e.pointerId)inlineDrag=null;};
  inlineSvg.addEventListener('pointerup',stop);
  inlineSvg.addEventListener('pointercancel',stop);
  get('inline-zoom-out').onclick=()=>{inlineWidth=Math.min(2600,inlineWidth*1.25);inlineTransform();};
  get('inline-zoom-in').onclick=()=>{inlineWidth=Math.max(330,inlineWidth*.8);inlineTransform();};
  get('inline-center').onclick=()=>centreInline(frameForInline?.current);
}
function inlineTransform() {
  const size=inlineSvg.getBoundingClientRect();
  if(!size.width||!size.height)return;
  const height=inlineWidth*size.height/size.width;
  const x=inlineCenter.x-inlineWidth/2;
  const y=Math.max(-14,inlineCenter.y-height*.48);
  inlineSvg.setAttribute('viewBox',`${x} ${y} ${inlineWidth} ${height}`);
}
function centreInline(id) {
  const node=byId.get(id);
  if(!node)return;
  inlineCenter={x:node.x+node.w/2,y:node.y+node.h/2};
  inlineTransform();
}
function renderInline(){
  if(!frameForInline)return;
  buildInline();
  const {trail,current,selection,answers,outcome}=frameForInline;
  const used=new Set(trail.map((item,i)=>key(item.step,trail[i+1]?.step??current)));
  const answered=new Set(trail.map(item=>item.step));
  const next=selection?nextStep(current,selection,answers):null;
  for(const [id,node] of inlineNodes){
    node.classList.toggle('inline-current',id===current);
    node.classList.toggle('inline-answered',answered.has(id));
  }
  for(const [id,edge] of inlineEdges){
    edge.classList.toggle('decision-edge-chosen',used.has(id));
    edge.classList.toggle('decision-edge-preview',!!next&&id===key(current,next));
    if(used.has(id))edge.parentNode.append(edge);
  }
  const label=outcome?.title??qTitle(current);
  get('live-map-status').textContent=(outcome?'Outcome: ':'Current question: ')+label;
  inlineSvg.querySelector('title').textContent='Decision map showing your route to '+label;
  if(inlineQuestion!==current){inlineQuestion=current;centreInline(current);}
  else inlineTransform();
}
function switchInline(useMap) {
  inlineActive=useMap;
  get('live-map').hidden=!useMap;
  get('live-path').hidden=useMap;
  get('path-branch-mode').setAttribute('aria-pressed',String(!useMap));
  get('path-map-mode').setAttribute('aria-pressed',String(useMap));
  if(useMap)renderInline();
}
get('path-branch-mode').addEventListener('click',()=>switchInline(false));
get('path-map-mode').addEventListener('click',()=>switchInline(true));

let built=false;
let x=0,y=0,zoom=1,selected=graph.root;
let assessment={trail:[],current:graph.root,answers:{},outcome:null};
const view=()=>get('question-viewport');
const board=()=>get('question-board');
const nodes=new Map(), edges=new Map();
const pointers=new Map();
let dragged=false;

function build(){
  if(built)return;
  built=true;
  const plane=board();
  plane.style.width=graph.width+'px';
  plane.style.height=graph.height+'px';
  const edgeLayer=svg('svg',{class:'question-edges',width:graph.width,height:graph.height,viewBox:`0 0 ${graph.width} ${graph.height}`,'aria-hidden':'true'});
  const defs=svg('defs');
  for(const [id,color] of [['decision-arrow','#78938a'],['decision-arrow-chosen','#18604d']]){
    const marker=svg('marker',{id,viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'6',markerHeight:'6',orient:'auto-start-reverse'});
    marker.append(svg('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:color}));
    defs.append(marker);
  }
  edgeLayer.append(defs);
  const ordered=graph.edges.map(edge=>{
    const label=edge.answers.map(answer=>answer.label).join(' / ');
    const line=svg('polyline',{class:'decision-edge',points:edge.points.map(p=>p.join(',')).join(' '),'marker-end':'url(#decision-arrow)'});
    const title=svg('title'); title.textContent=label; line.append(title);
    edges.set(key(edge.from,edge.to),line);
    return line;
  });
  edgeLayer.append(...ordered);
  plane.append(edgeLayer);
  for(const node of graph.nodes) {
    const n=button('',`question-node ${node.type==='outcome'?'question-outcome':''}`,()=>focusNode(node.id,{preserveZoom:true}));
    n.style.left=node.x+'px'; n.style.top=node.y+'px'; n.style.width=node.w+'px'; n.style.height=node.h+'px';
    n.append(make('small',null,node.type==='outcome'?'Outcome':node.stage),make('strong',null,node.title));
    nodes.set(node.id,n);
    plane.append(n);
  }
  const search=get('question-search');
  search.addEventListener('input',updateSearch);
  search.addEventListener('focus',updateSearch);
  search.addEventListener('keydown',event=>{
    const results=get('question-search-results');
    if(event.key==='Escape')results.hidden=true;
    if(!results.hidden&&['Enter','ArrowDown'].includes(event.key)){
      event.preventDefault();
      if(event.key==='Enter')results.querySelector('button')?.click();
      else results.querySelector('button')?.focus();
    }
  });
  document.addEventListener('pointerdown',event=>{
    if(!event.target.closest('.map-search'))get('question-search-results').hidden=true;
  });
  get('question-zoom-in').onclick=()=>scale(1.25);
  get('question-zoom-out').onclick=()=>scale(.8);
  get('question-fit').onclick=fit;
  get('question-start').onclick=()=>focusNode(graph.root);
  get('question-current').onclick=()=>focusNode(assessment.current);
  bindMap();
}

function updateStyle() {
  const answered=new Set(assessment.trail.map(item=>item.step));
  const used=new Set(assessment.trail.map((item,index)=>key(item.step,assessment.trail[index+1]?.step??assessment.current)));
  for(const [id,node] of nodes) {
    node.classList.toggle('question-answered',answered.has(id));
    node.classList.toggle('question-active',id===assessment.current);
    node.classList.toggle('question-inspected',id===selected);
    node.setAttribute('aria-pressed',String(id===selected));
  }
  for(const [id,path] of edges) {
    const chosen=used.has(id);
    path.classList.toggle('decision-edge-chosen',chosen);
    path.setAttribute('marker-end',chosen?'url(#decision-arrow-chosen)':'url(#decision-arrow)');
    if(chosen) path.parentNode.append(path);
  }
}

function showDetails(id) {
  const info=byId.get(id);
  if(!info)return;
  const facts=getStep(id,assessment.answers);
  const current=id===assessment.current;
  const answered=assessment.trail.find(entry=>entry.step===id);
  const box=get('question-detail');
  box.replaceChildren();
  box.append(make('p','step-label',current?'Current in assessment':info.type==='outcome'?'Outcome':'Question'));
  box.append(make('h2',null,current&&assessment.outcome?assessment.outcome.title:info.title));
  box.append(make('p','detail-description',current&&assessment.outcome?assessment.outcome.description:info.description));
  if(answered) box.append(make('p','detail-answer','Your answer: '+answered.label));
  if(info.type==='outcome')return;
  const known=outgoing.get(id)??[];
  const choices=current&&facts?facts.options.map(choice=>({
    label:choice.label,
    value:choice.value,
    targets:[nextStep(id,choice.value,assessment.answers)],
  })):groupChoices(known);
  box.append(make('h3',null,'Branches'));
  const list=make('ul','node-options');
  for(const choice of choices) {
    const li=make('li',answered?.choice===choice.value?'node-option-selected':null);
    li.append(make('strong',null,choice.label));
    if(choice.targets.length>1)li.append(make('small',null,'Next question depends on earlier answers.'));
    for(const destination of choice.targets) li.append(button(qTitle(destination),'node-target',()=>focusNode(destination,{preserveZoom:true})));
    list.append(li);
  }
  box.append(list);
}
function groupChoices(sections) {
  const choices=new Map();
  for(const edge of sections) {
    for(const option of edge.answers) {
      if(!choices.has(option.value)) choices.set(option.value,{...option,targets:[]});
      choices.get(option.value).targets.push(edge.to);
    }
  }
  return [...choices.values()];
}
function draw() {
  board().style.transform=`translate(${x}px,${y}px) scale(${zoom})`;
  get('question-zoom-level').textContent=Math.round(zoom*100)+'%';
}
function focusNode(id,{preserveZoom=false}={}) {
  const node=byId.get(id);
  if(!node || view().hidden || !view().clientWidth)return;
  selected=id;
  if(!preserveZoom||zoom<.42)zoom=Math.min(.93,(view().clientWidth-38)/node.w);
  const desiredY=node.y*zoom+node.h*zoom/2;
  x=view().clientWidth/2-(node.x+node.w/2)*zoom;
  y=Math.min(20,view().clientHeight*.33-desiredY);
  updateStyle();
  showDetails(id);draw();
}
function fit() {
  const v=view();
  zoom=Math.min((v.clientWidth-20)/graph.width,(v.clientHeight-28)/graph.height);
  x=(v.clientWidth-graph.width*zoom)/2;
  y=10;
  draw();
}
function scale(amount,px=view().clientWidth/2,py=view().clientHeight/2) {
  const next=Math.max(.035,Math.min(1.7,zoom*amount));
  x=px-(px-x)*next/zoom; y=py-(py-y)*next/zoom; zoom=next;draw();
}
function updateSearch() {
  const query=get('question-search').value.toLowerCase().trim();
  const hits=get('question-search-results');
  hits.replaceChildren();
  hits.hidden=!query;
  if(!query)return;
  const words=query.split(/\s+/);
  const found=graph.nodes.filter(node=>words.every(word=>(node.title+' '+node.description).toLowerCase().includes(word))).slice(0,16);
  for(const node of found) {
    const entry=button(node.title,null,()=>{
      focusNode(node.id);
      hits.hidden=true;
      view().focus({preventScroll:true});
    });
    entry.append(make('small',null,node.stage));
    hits.append(entry);
  }
  if(!found.length)hits.append(make('p',null,'No matching question.'));
}
function bindMap(){
  const v=view();
  v.addEventListener('wheel',e=>{
    e.preventDefault();
    if(e.ctrlKey||e.metaKey){const b=v.getBoundingClientRect();scale(Math.exp(-e.deltaY*.007),e.clientX-b.left,e.clientY-b.top);}
    else{x-=e.deltaX;y-=e.deltaY;draw();}
  },{passive:false});
  v.addEventListener('keydown',e=>{
    if(e.target!==v)return;
    switch(e.key){
      case '+':case '=': scale(1.25);break;
      case '-':scale(.8);break;
      case 'ArrowLeft':x+=55;break;
      case 'ArrowRight':x-=55;break;
      case 'ArrowUp':y+=55;break;
      case 'ArrowDown':y-=55;break;
      case 'Home':focusNode(graph.root);break;
      default:return;
    }
    e.preventDefault();draw();
  });
  v.addEventListener('pointerdown',e=>{
    if(e.target.closest('.map-nav')||(e.pointerType==='mouse'&&e.button!==0))return;
    if(!pointers.size)dragged=false;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  });
  v.addEventListener('pointermove',e=>{
    const old=pointers.get(e.pointerId);
    if(!old)return;
    const second=[...pointers.entries()].find(([id])=>id!==e.pointerId)?.[1];
    const dx=e.clientX-old.x,dy=e.clientY-old.y;
    if(!dragged&&!second&&Math.hypot(dx,dy)<4)return;
    if(!v.hasPointerCapture(e.pointerId))v.setPointerCapture(e.pointerId);
    dragged=true;
    v.classList.add('dragging');
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(second) {
      const b=v.getBoundingClientRect(), before=Math.hypot(old.x-second.x,old.y-second.y);
      if(before>1)scale(Math.hypot(e.clientX-second.x,e.clientY-second.y)/before,(e.clientX+second.x)/2-b.left,(e.clientY+second.y)/2-b.top);
    } else {x+=dx;y+=dy;draw();}
  });
  const stop=e=>{pointers.delete(e.pointerId);if(!pointers.size)v.classList.remove('dragging');};
  v.addEventListener('pointerup',stop);
  v.addEventListener('pointercancel',stop);
  v.addEventListener('pointerleave',e=>{if(!v.hasPointerCapture(e.pointerId))stop(e);});
  v.addEventListener('click',e=>{
    if(dragged && e.target.closest('.question-node')){e.preventDefault();e.stopPropagation();dragged=false;}
  },true);
}
export function showQuestionMap(frame,id) {
  assessment=frame;
  build();
  requestAnimationFrame(()=>focusNode(byId.has(id)?id:frame.current));
}

