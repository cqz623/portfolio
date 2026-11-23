import {paletteColor,paletteGradient} from './atlas.js';
import {initialState,neighbors,same,legalMoves,act,wallError,bfs,manhattan,manhattanPath,relative,nearWall,describeCells,gridToScreen,screenToGrid,demoState,distanceField,fieldDifference,compass,boundaryDescription,barrierEdges,manhattanField,detourField,comparisonStats,shortestGoalPath} from './core.js';
const $=id=>document.getElementById(id);
let state=initialState(),history=[],tab='game',mode='move',matches=[],selectedCell=null,endpoints=[{...state.players[0]},{...state.players[1]}],followPlayers=true;
let comparison=null, pickOrigin=false, fixedOrigin={r:8,c:4};
const coord=p=>`(${p.r}, ${p.c})`;
function message(text,error=false){$('message').textContent=text;$('message').classList.toggle('error',error);}
// Comparison stores topology snapshots, never a second playable game state.
function commit(next){
 history.push({state:structuredClone(state),comparison:structuredClone(comparison)});
 const addedWall=next.walls.length===state.walls.length+1;
 comparison=addedWall?{before:structuredClone(state.walls),after:structuredClone(next.walls),wall:structuredClone(next.walls.at(-1)),origin:structuredClone(fieldOrigin()),beforeField:distanceField(fieldOrigin(),state.walls),afterField:distanceField(fieldOrigin(),next.walls)}:null;
 state=next;matches=[];render();
}
function fieldOrigin(){return $('origin').value==='cell'?fixedOrigin:state.players[$('origin').value==='a'?0:1];}
function analysisWalls(){return comparison&&$('field-view').value==='before'?comparison.before:state.walls;}
for(const id of ['heatmap','show-paths','show-network','show-reference','show-query','field-view','heat-mode']) $(id).onchange=render;
$('origin').onchange=()=>{render();message('Origin updated. Both comparison fields use this same origin.');};
$('pick-origin').onclick=()=>{pickOrigin=true;message('Click any board cell to set the heatmap origin. This will not move a pawn.');};

function setTab(name){tab=name;$('analysis-heading').textContent=name.toUpperCase();document.querySelectorAll('[data-tab]').forEach(b=>{const on=b.dataset.tab===name;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;});['game','location','distance'].forEach(id=>$(id).hidden=id!==name);render();}
document.querySelectorAll('[data-tab]').forEach(b=>{b.onclick=()=>setTab(b.dataset.tab);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const ids=['game','location','distance'];const i=e.key==='Home'?0:e.key==='End'?2:(ids.indexOf(tab)+(e.key==='ArrowRight'?1:2))%3;setTab(ids[i]);$('tab-'+ids[i]).focus();}};});
$('move-mode').onclick=()=>{mode='move';$('field-view').value='current';render();};$('wall-mode').onclick=()=>{mode='wall';$('field-view').value='current';render();};$('orientation').onchange=render;
$('undo').onclick=()=>{if(history.length){const previous=history.pop();state=previous.state;comparison=previous.comparison;matches=[];render();message('Previous board restored.');}};
$('reset').onclick=()=>{commit(initialState());mode='move';followPlayers=true;endpoints=state.players.map(p=>({...p}));selectedCell=null;$('origin').value='a';fixedOrigin={r:8,c:4};$('field-view').value='current';render();message('New game. Player A begins. Undo can restore the previous board.');};
$('demo').onclick=()=>{followPlayers=true;commit(demoState());message('Detour demo loaded: 2 Manhattan steps, 10 walkable steps. Undo restores the previous board.');};
$('compare').onclick=()=>{followPlayers=true;$('origin').value='a';render();message('Endpoints follow the player positions.');};
$('object').onchange=()=>{const value=$('object').value;if(value==='a'||value==='b')selectedCell={...state.players[value==='a'?0:1]};renderLocation();renderBoard();};$('reference').onchange=renderLocation;
$('query-form').onsubmit=e=>{e.preventDefault();try{matches=describeCells($('expression').value,state);$('query-result').dataset.active='true';$('query-result').textContent=`${matches.length} matching cell(s).`;renderBoard();message('Semantic query highlighted on the board.');}catch(error){$('query-result').dataset.active='false';matches=[];renderBoard();$('query-result').textContent=error.message;message(error.message,true);}};
function clickCell(p){if(pickOrigin){fixedOrigin={...p};$('origin').value='cell';pickOrigin=false;render();message(`BFS origin set to ${coord(p)}.`);return;}if(tab==='location'){selectedCell=p;renderLocation();renderBoard();return;}if(tab==='distance'){endpoints=[{...fieldOrigin()},{...p}];followPlayers=false;render();return;}if($('field-view').value==='before'){message('Historical view: choose Move pawn or Place barrier to return to the current board before playing.',true);return;}if(mode==='wall'){message('Choose a small boundary anchor to place a barrier.',true);return;}const result=act(state,{type:'move',to:p});if(result.error)message(result.error,true);else{commit(result.state);message(state.winner!==null?`Player ${state.winner===0?'A':'B'} wins!`:`Player ${state.turn===0?'A':'B'}’s turn.`);}}
function wallElement(w,preview=false){const el=document.createElement('div');el.className='wall'+(preview?' preview':'');const horizontal=w.o==='h';Object.assign(el.style,{left:`${(horizontal?w.c:w.c+1)/9*100}%`,top:`${(horizontal?w.r+1:w.r)/9*100}%`,width:horizontal?'22.222%':'1.6%',height:horizontal?'1.6%':'22.222%',transform:horizontal?'translateY(-50%)':'translateX(-50%)'});return el;}
function renderBoard(){const board=$('board');board.replaceChildren();const moves=legalMoves(state);const field=activeField();for(let r=0;r<9;r++)for(let c=0;c<9;c++){const p={r,c},cell=document.createElement('button');cell.className='cell';cell.setAttribute('aria-label',`Row ${r}, column ${c}${state.players.some(q=>same(p,q))?', Player '+(same(p,state.players[0])?'A':'B'):''}`);cell.innerHTML=`<span class="coord">${r},${c}</span>`;if(field)paintField(cell,p,field);if((field||tab==='distance')&&same(p,fieldOrigin())){cell.classList.add('field-origin');cell.innerHTML+='<span class="origin-tag">O</span>';}state.players.forEach((q,i)=>{if(same(p,q)){cell.setAttribute('aria-label',(field?cell.getAttribute('aria-label'):`Row ${r}, column ${c}`)+`, Player ${i===0?'A':'B'}`);cell.innerHTML+=`<span class="pawn ${i===0?'a':'b'}">${i===0?'A':'B'}</span>`;}});if(tab==='game'&&$('field-view').value!=='before'&&mode==='move'&&moves.some(q=>same(p,q)))cell.classList.add('legal');if($('show-query').checked&&matches.some(q=>same(p,q)))cell.classList.add('match');if(tab==='location'&&selectedCell&&same(p,selectedCell))cell.classList.add('endpoint');if(tab==='distance')currentEndpoints().forEach((q,i)=>{if(same(p,q)){cell.classList.add('endpoint');if(i===1)cell.innerHTML+='<span class="endpoint-tag">D</span>';}});cell.onclick=()=>clickCell(p);board.append(cell);}
const layer=$('walls');layer.replaceChildren();analysisWalls().forEach((w,i)=>{const el=wallElement(w);if(tab==='location'&&$('object').value===`w${i}`)el.classList.add('inspected');layer.append(el);});if(comparison&&$('field-view').value==='before'){const ghost=wallElement(comparison.wall);ghost.classList.add('ghost');layer.append(ghost);}if(tab==='game'&&$('field-view').value!=='before'&&mode==='wall'&&state.winner===null)for(let r=0;r<8;r++)for(let c=0;c<8;c++){const w={r,c,o:$('orientation').value},anchor=document.createElement('button');anchor.className='anchor';anchor.style.left=`${(c+1)/9*100}%`;anchor.style.top=`${(r+1)/9*100}%`;anchor.setAttribute('aria-label',`Place ${w.o==='h'?'horizontal':'vertical'} barrier at ${r}, ${c}`);const preview=()=>{layer.querySelector('.preview')?.remove();const el=wallElement(w,true);el.classList.toggle('invalid',!!wallError(state,w));layer.append(el);};anchor.onmouseenter=preview;anchor.onfocus=preview;anchor.onmouseleave=()=>layer.querySelector('.preview')?.remove();anchor.onblur=anchor.onmouseleave;anchor.onclick=()=>{const result=act(state,{type:'wall',wall:w});if(result.error)message(result.error,true);else{commit(result.state);message(`Barrier placed. Player ${state.turn===0?'A':'B'}’s turn.`);}};layer.append(anchor);}
$('board-hint').textContent=tab==='game'&&$('field-view').value==='before'?'Historical topology • choose a game action to return to the current board':tab==='distance'?'Choose an origin, then click a destination to measure its shortest route.':tab==='location'?'Click a cell to inspect its location.':mode==='wall'?'Choose a boundary anchor • two edges per barrier':'Move to a highlighted cell • one step per turn';renderNetwork();renderPaths();renderAnnotations();}
function currentEndpoints(){return [fieldOrigin(),followPlayers?state.players[1]:endpoints.at(-1)];}
function renderPaths(){const svg=$('paths');svg.replaceChildren();if(tab!=='distance'||!$('show-paths').checked||currentEndpoints().length!==2)return;const [a,b]=currentEndpoints();const paths=[{path:manhattanPath(a,b),color:'#666666',dash:'12 9',width:9},{path:bfs(a,b,analysisWalls()),color:'#111111',width:5}];paths.forEach(({path,color,dash,width})=>{if(!path||(dash&&!$('show-reference').checked))return;const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');line.setAttribute('points',path.map(p=>`${(p.c+.5)*100},${(p.r+.5)*100}`).join(' '));line.setAttribute('fill','none');line.setAttribute('stroke',color);line.setAttribute('stroke-width',width);line.setAttribute('stroke-linejoin','round');line.setAttribute('stroke-linecap','round');line.setAttribute('opacity','.75');if(dash)line.setAttribute('stroke-dasharray',dash);if(!dash){const casing=line.cloneNode();casing.setAttribute('stroke','#ffffff');casing.setAttribute('stroke-width',width+4);casing.setAttribute('opacity','.95');svg.append(casing);}svg.append(line);});}
function renderLocation(){const old=$('object').value;$('object').replaceChildren();[['a','Player A'],['b','Player B'],...state.walls.map((w,i)=>[`w${i}`,`Barrier ${i+1} · ${w.o==='h'?'horizontal':'vertical'}`])].forEach(([value,text])=>{const option=document.createElement('option');option.value=value;option.textContent=text;$('object').append(option);});if([...$('object').options].some(o=>o.value===old))$('object').value=old;const value=$('object').value;if(value.startsWith('w')){const w=state.walls[+value.slice(1)];$('object-result').textContent=`Anchor ${coord(w)} · ${w.o==='h'?'horizontal: between rows '+w.r+' and '+(w.r+1)+', columns '+w.c+'–'+(w.c+1):'vertical: between columns '+w.c+' and '+(w.c+1)+', rows '+w.r+'–'+(w.r+1)}. Separated cell pairs: ${barrierEdges(w).map(pair=>pair.map(coord).join(' ↔ ')).join('; ')}. Barriers occupy boundaries, never cells.`;}else{const i=value==='a'?0:1,p=state.players[i];$('object-result').textContent=`Player ${i===0?'A':'B'} · row ${p.r}, column ${p.c}. ${Math.abs(p.r-(i===0?0:8))} rows from goal boundary. ${nearWall(p,state.walls)?'Near a barrier.':'No barrier touches this cell.'}`;}
const inspected=selectedCell??state.players[$('object').value==='b'?1:0];
const reference=$('reference').value==='origin'?{r:0,c:0}:state.players[$('reference').value==='a'?0:1];
$('relative-result').textContent=`Selected ${coord(inspected)} is ${compass(inspected,reference)}: ${relative(inspected,reference)} of ${$('reference').value==='origin'?'the northwest origin':'Player '+$('reference').value.toUpperCase()}. ${manhattan(inspected,reference)===1?'Orthogonally adjacent. ':''}${boundaryDescription(inspected)} Adjacent board cells: ${[{r:inspected.r-1,c:inspected.c},{r:inspected.r+1,c:inspected.c},{r:inspected.r,c:inspected.c-1},{r:inspected.r,c:inspected.c+1}].filter(p=>p.r>=0&&p.r<9&&p.c>=0&&p.c<9).map(coord).join(', ')}. Adjacency here is geometric, ignoring barriers.`;
if(selectedCell){const rect=$('board').getBoundingClientRect(),screen=gridToScreen(selectedCell,rect),roundTrip=screenToGrid(screen,rect);const occupant=state.players.findIndex(p=>same(p,selectedCell));$('cell-result').textContent=`Board cell R${selectedCell.r}C${selectedCell.c}, row/column ${coord(selectedCell)}: ${occupant<0?'empty':'Player '+(occupant===0?'A':'B')}. Viewport center: (${screen.x.toFixed(1)}, ${screen.y.toFixed(1)}) px. Screen → grid: ${coord(roundTrip)}. Cell size: ${(rect.width/9).toFixed(1)} × ${(rect.height/9).toFixed(1)} px.`;}}
function renderDistance(){const points=currentEndpoints();$('distance-context').textContent=comparison&&$('field-view').value==='before'?'Metrics and routes use the BEFORE topology. Goal distances below always refer to the current game.':'Metrics and routes use the current board. Goal distances refer to the current game.';$('endpoints').textContent=points.length===2?`Start ${coord(points[0])} → Target ${coord(points[1])}${followPlayers?' · destination follows Player B':''}`:`Start ${coord(points[0])} → click a target cell`;
let m=null,d=null;if(points.length===2){m=manhattan(...points);const path=bfs(...points,analysisWalls());d=path?path.length-1:null;}$('manhattan').textContent=m??'—';$('walkable').textContent=d??(points.length===2?'∞':'—');$('detour').textContent=d===null?(points.length===2?'No walkable route connects these endpoints.':'Choose both endpoints to compare.'):`+${d-m} steps of detour`;const [origin,destination]=points;
$('distance-explanation').textContent=d===null
 ? `Origin ${coord(origin)} and destination ${coord(destination)} have geometric grid distance ${m}, but no walkable route connects them in this topology. Accessibility is lost; the coordinates remain unchanged.`
 : d>m
 ? `These cells ${coord(origin)} and ${coord(destination)} are ${m===1?'geometrically adjacent':`separated by ${m} geometric grid steps`} (Manhattan = ${m}), but barriers force a detour (BFS = ${d}). The shortest traversable route adds ${d-m} steps without changing either location.`
 : m===0
 ? `Origin and destination are the same cell ${coord(origin)}: both distances are 0.`
 : `From ${coord(origin)} to ${coord(destination)}, Manhattan and BFS both equal ${m}. Barriers do not force extra travel for this pair; a Manhattan-length traversable route exists.`;
$('goal-distances').innerHTML=state.players.map((p,i)=>`<span><b>${i===0?'A → NORTH':'B → SOUTH'}</b><em>${shortestGoalPath(state,i)?.length-1} steps</em></span>`).join('');}
function render(){ if($('query-result').dataset.active==='true'){try{matches=describeCells($('expression').value,state);$('query-result').textContent=`${matches.length} matching cell(s).`;}catch{matches=[];}} $('turn-title').textContent=state.winner!==null?`Player ${state.winner===0?'A':'B'} wins!`:`Player ${state.turn===0?'A':'B'}, your move.`;$('board-status').textContent=state.winner!==null?'● GAME COMPLETE':`● PLAYER ${state.turn===0?'A':'B'} TO PLAY`;$('players').innerHTML=state.players.map((p,i)=>`<div class="player-card ${state.turn===i?'active':''}"><strong><i class="dot ${i===0?'a':'b'}"></i> Player ${i===0?'A':'B'}</strong><small>${coord(p)} · ${state.remaining[i]} barriers</small></div>`).join('');$('move-mode').classList.toggle('selected',mode==='move');$('wall-mode').classList.toggle('selected',mode==='wall');$('wall-options').hidden=mode!=='wall';$('undo').disabled=!history.length;renderFieldControls();renderArchiveStatus();renderLocation();renderBoard();renderDistance();}
window.addEventListener('scroll',()=>{if(tab==='location'&&selectedCell)renderLocation();},{passive:true});
window.addEventListener('resize',()=>{if(tab==='location')renderLocation();});render();

/** Historical views always show BFS; current mode selects a geometric or graph field. */
function activeField(){
 if(!$('heatmap').checked)return null;
 const origin=fieldOrigin(),view=$('field-view').value,metric=$('heat-mode').value;
 const before=comparison?.beforeField??distanceField(origin,state.walls);
 const after=comparison?.afterField??distanceField(origin,state.walls);
 if(comparison&&view!=='current')return {
   values:view==='difference'?fieldDifference(before,after):view==='before'?before:after,
   difference:view==='difference',kind:view==='difference'?'comparison':'bfs',
   max:Math.max(1,...before.filter(Number.isFinite),...after.filter(Number.isFinite))
 };
 const values=metric==='manhattan'?manhattanField(origin):metric==='detour'?detourField(origin,state.walls):after;
 return {values,difference:metric==='detour',kind:metric,max:Math.max(1,...values.filter(Number.isFinite))};
}
function paintField(cell,p,field){
 const value=field.values[p.r*9+p.c];
 const label=document.createElement('span');label.className='field-value';
 let text;
 if(value===null||typeof value==='string'){
   text=value==='lost'?'×':value==='gained'?'new':'∞';cell.classList.add('unreachable');
   if(value==='lost'||value==='gained')cell.classList.add('changed');
 }else{
   text=field.difference?(value>=0?'+':'')+value:String(value);
   const ratio=field.difference?Math.min(Math.abs(value)/(field.kind==='comparison'?Math.max(1,...field.values.filter(Number.isFinite).map(Math.abs)):field.max),1):value/field.max;
   // Scientific color is confined to spatial data; numeric labels stay high contrast.
   cell.style.backgroundColor=paletteColor(field.kind,ratio);
   if(field.difference&&value!==0)cell.classList.add('changed');
 }
 label.textContent=text;cell.append(label);
 const name=field.kind==='comparison'?'barrier distance change':field.kind==='detour'?'detour':field.kind==='manhattan'?'Manhattan distance':'BFS distance';
 cell.setAttribute('title',`${coord(p)} · ${name}: ${text}`);
 cell.setAttribute('aria-label',`Row ${p.r}, column ${p.c}, ${name} ${text}`);
}
function renderFieldControls(){
 const view=$('field-view');
 for(const option of view.options)option.disabled=option.value!=='current'&&!comparison;
 if(!comparison)view.value='current';
 // Comparisons are a numeric layer; choosing one makes that layer visible.
 if(view.value!=='current'&&comparison&&!$('heatmap').checked&&document.activeElement===view)$('heatmap').checked=true;
 const origin=fieldOrigin();
 $('field-status').textContent=comparison?`Origin ${coord(origin)} · latest barrier ${comparison.wall.o==='h'?'horizontal':'vertical'} ${coord(comparison.wall)}. Pawns have identical positions before and after. ${view.value==='before'?'Dashed barrier is pending in this historical view.':'Dark barriers show the current board.'}`:`Origin ${coord(origin)} · place a barrier to enable Before / After / Difference. Moves, Reset and demo loading clear the comparison; Undo restores it.`;
 // Recalculate saved fields when the user changes the shared origin.
 if(comparison&&!same(comparison.origin,origin)){
   comparison.origin={...origin};
   comparison.beforeField=distanceField(origin,comparison.before);
   comparison.afterField=distanceField(origin,comparison.after);
 }
 const statsPanel=$('comparison-stats');statsPanel.hidden=!comparison;
 if(comparison){
   const stats=comparisonStats(comparison.beforeField,comparison.afterField);
   statsPanel.innerHTML=`<strong>Latest barrier · BFS accessibility change</strong><div><span>Affected cells <b>${stats.affected} / 81</b></span><span>Maximum increase <b>+${stats.maxIncrease} steps</b></span><span>Average increase <b>+${stats.averageIncrease.toFixed(2)} steps</b></span></div><p>Average and maximum use ${stats.reachableAffected} affected cells reachable in both fields. Newly unreachable: ${stats.newlyUnreachable}.</p>`;
 }
 $('heat-mode').disabled=view.value!=='current';
 document.querySelectorAll('[data-metric]').forEach(button=>{button.disabled=$('heat-mode').disabled;button.setAttribute('aria-pressed',button.dataset.metric===$('heat-mode').value);});
 const legend=$('heat-legend');legend.hidden=!$('heatmap').checked;$('legend-empty').hidden=$('heatmap').checked;
 const field=activeField();
 if(!field)return;
 const descriptions={
   manhattan:['Manhattan · geometric grid distance, ignoring barriers.','Fluorescent yellow: exact row + column differences. Physical barriers do not affect these values.'],
   bfs:['BFS · shortest traversable route, accounting for barriers.','Blue / purple: minimum steps through valid connections. Hatched ∞ cells are unreachable.'],
   detour:['Detour · additional travel distance caused by spatial barriers.','BFS − Manhattan. Pale +0 means no detour; orange → red shows extra steps. ∞ means unreachable.'],
   comparison:['Barrier difference · after BFS − before BFS.','Neutral +0 = unchanged; +n = added steps; × = newly unreachable; ∞ = unreachable in both; new = newly reachable.']
 };
 const [title,description]=descriptions[field.kind];
 const scaleMax=field.difference?Math.max(0,...field.values.filter(Number.isFinite).map(Math.abs)):field.max;
 legend.innerHTML=`<strong>${title}</strong><div class="heat-ramp ${field.kind}" style="background:${paletteGradient(field.kind)}"></div><p>${field.difference?`SCALE +0 → +${scaleMax} STEPS`:`SCALE 0 → ${field.max} STEPS`}</p><details><summary>READ SCALE / KEY</summary><p>${description} ${view.value==='before'||view.value==='after'?'Before and After share one scale.':''} O = origin · D = destination. Pawns are permeable in analysis.</p></details>`;
}

// Presentation controls reuse the existing metric selector and render pipeline.
document.querySelectorAll('[data-metric]').forEach(button=>{
 button.onclick=()=>{
   $('heat-mode').value=button.dataset.metric;
   $('heatmap').checked=true;
   render();
 };
});

/** A construction leader identifies the inspected cell, not a walkable connection. */
function renderAnnotations(){
 const svg=$('annotations');svg.replaceChildren();
 const selected=tab==='location'?selectedCell:tab==='distance'?currentEndpoints()[1]:null;
 $('field-annotation').textContent=selected
   ? `${tab==='location'?'INSPECT':'DEST'} [${selected.r},${selected.c}] / ${tab==='distance'?'BFS + L₁':'GRID FRAME'}`
   : `A [${state.players[0].r},${state.players[0].c}] / B [${state.players[1].r},${state.players[1].c}]`;
 if(!selected)return;
 const x=(selected.c+.5)*100,y=(selected.r+.5)*100,edge=selected.c<4?0:900;
 const line=document.createElementNS('http://www.w3.org/2000/svg','line');
 for(const [key,value] of Object.entries({x1:x,y1:y,x2:edge,y2:y,stroke:'#111','stroke-width':1.5,'stroke-dasharray':'5 7'}))line.setAttribute(key,value);
 svg.append(line);
 const text=document.createElementNS('http://www.w3.org/2000/svg','text');
 text.setAttribute('x',edge===0?6:894);text.setAttribute('y',y-9);text.setAttribute('text-anchor',edge===0?'start':'end');
 text.textContent=`[${selected.r},${selected.c}]`;svg.append(text);
}

/** Optional topology layer: one undirected connection per actual traversable edge. */
function renderNetwork(){
 const svg=$('network');svg.replaceChildren();
 if(!$('show-network').checked)return;
 const walls=analysisWalls();
 for(let r=0;r<9;r++)for(let c=0;c<9;c++){
   const p={r,c};
   for(const q of neighbors(p,walls)){
     if(q.r*9+q.c<=r*9+c)continue;
     const edge=document.createElementNS('http://www.w3.org/2000/svg','line');
     for(const [key,value] of Object.entries({x1:(c+.5)*100,y1:(r+.5)*100,x2:(q.c+.5)*100,y2:(q.r+.5)*100}))edge.setAttribute(key,value);
     svg.append(edge);
   }
   const node=document.createElementNS('http://www.w3.org/2000/svg','circle');
   node.setAttribute('cx',(c+.5)*100);node.setAttribute('cy',(r+.5)*100);node.setAttribute('r',3);svg.append(node);
 }
}

/** The archival masthead and status strip always reflect the shared live state. */
function renderArchiveStatus(){
 const player=state.winner!==null?state.winner:state.turn;
 $('header-status').textContent=`${tab.toUpperCase()} / ${state.winner!==null?'WINNER':'TURN'} ${player===0?'A':'B'}`;
 $('status-a').textContent=`A [${state.players[0].r},${state.players[0].c}] / ${state.remaining[0]} BARRIERS`;
 $('status-b').textContent=`B [${state.players[1].r},${state.players[1].c}] / ${state.remaining[1]} BARRIERS`;
 const view=$('field-view').value;
 const metricNames={manhattan:'MANHATTAN',bfs:'BFS',detour:'DIFFERENCE'};
 const fieldLabel=comparison&&view!=='current'?(view==='difference'?'BARRIER DIFFERENCE':'BFS '+view.toUpperCase()):metricNames[$('heat-mode').value];
 $('status-mode').textContent=`MODE ${tab.toUpperCase()} / ${$('heatmap').checked?fieldLabel:'HEATMAP OFF'}`;
 $('status-walls').textContent=`PLACED ${state.walls.length} / VIEW ${$('field-view').value.toUpperCase()}`;
}
