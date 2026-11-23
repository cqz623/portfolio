/** Pure game and spatial functions. All coordinates are zero-based. */
export const SIZE = 9;
export const initialState = () => ({players:[{r:8,c:4},{r:0,c:4}],walls:[],remaining:[10,10],turn:0,winner:null});
export const same=(a,b)=>a.r===b.r&&a.c===b.c;
export const inside=p=>Number.isInteger(p.r)&&Number.isInteger(p.c)&&p.r>=0&&p.r<9&&p.c>=0&&p.c<9;
export function blocked(a,b,walls){return walls.some(w=>w.o==='h'?a.c===b.c&&Math.min(a.r,b.r)===w.r&&a.r!==b.r&&(a.c===w.c||a.c===w.c+1):a.r===b.r&&Math.min(a.c,b.c)===w.c&&a.c!==b.c&&(a.r===w.r||a.r===w.r+1));}
export function neighbors(p,walls){return [{r:p.r-1,c:p.c},{r:p.r+1,c:p.c},{r:p.r,c:p.c-1},{r:p.r,c:p.c+1}].filter(q=>inside(q)&&!blocked(p,q,walls));}
/** Distance analysis treats both pawns as permeable markers. */
export function bfs(start,target,walls=[]){const queue=[start],parents=new Map([[`${start.r},${start.c}`,null]]);let end=null;for(let i=0;i<queue.length;i++){const p=queue[i];if(typeof target==='function'?target(p):same(p,target)){end=p;break;}for(const q of neighbors(p,walls)){const k=`${q.r},${q.c}`;if(!parents.has(k)){parents.set(k,p);queue.push(q);}}}if(!end)return null;const path=[];while(end){path.push(end);end=parents.get(`${end.r},${end.c}`);}return path.reverse();}
export const manhattan=(a,b)=>Math.abs(a.r-b.r)+Math.abs(a.c-b.c);
export function manhattanPath(a,b){const path=[{...a}];let p={...a};while(p.c!==b.c){p={r:p.r,c:p.c+Math.sign(b.c-p.c)};path.push(p);}while(p.r!==b.r){p={r:p.r+Math.sign(b.r-p.r),c:p.c};path.push(p);}return path;}
/** Adjacent pawns block entry; there are no jumps or diagonal moves. */
export function legalMoves(s){if(s.winner!==null)return [];return neighbors(s.players[s.turn],s.walls).filter(p=>!same(p,s.players[1-s.turn]));}
export function wallError(s,w){if(s.winner!==null)return 'The game has ended.';if(!['h','v'].includes(w.o)||!Number.isInteger(w.r)||!Number.isInteger(w.c)||w.r<0||w.r>7||w.c<0||w.c>7)return 'Barrier anchors must be between rows and columns 0–7.';if(s.remaining[s.turn]===0)return 'No barriers remaining.';if(s.walls.some(v=>v.o===w.o?(v.o==='h'?v.r===w.r&&Math.abs(v.c-w.c)<2:v.c===w.c&&Math.abs(v.r-w.r)<2):v.r===w.r&&v.c===w.c))return 'Barriers cannot overlap or cross.';const walls=[...s.walls,w];if(s.players.some((p,i)=>!bfs(p,q=>q.r===(i===0?0:8),walls)))return 'Each player must retain a path to their goal.';return null;}
export function act(s,action){if(action.type==='move'){if(!legalMoves(s).some(p=>same(p,action.to)))return {error:'Choose a highlighted legal move.'};const next=structuredClone(s);next.players[s.turn]={...action.to};if(action.to.r===(s.turn===0?0:8))next.winner=s.turn;else next.turn=1-s.turn;return {state:next};}const error=wallError(s,action.wall);if(error)return {error};const next=structuredClone(s);next.walls.push({...action.wall});next.remaining[s.turn]--;next.turn=1-s.turn;return {state:next};}
export function gridToScreen(p,rect){return {x:rect.left+(p.c+.5)*rect.width/9,y:rect.top+(p.r+.5)*rect.height/9};}
export function screenToGrid(p,rect){const q={r:Math.floor((p.y-rect.top)*9/rect.height),c:Math.floor((p.x-rect.left)*9/rect.width)};return inside(q)?q:null;}
export function relative(a,b){const parts=[];if(a.r!==b.r)parts.push(`${Math.abs(a.r-b.r)} row(s) ${a.r<b.r?'north':'south'}`);if(a.c!==b.c)parts.push(`${Math.abs(a.c-b.c)} column(s) ${a.c<b.c?'west':'east'}`);return parts.join(' and ')||'at the same location';}
export function nearWall(p,walls){return walls.some(w=>w.o==='h'?(p.r===w.r||p.r===w.r+1)&&(p.c===w.c||p.c===w.c+1):(p.c===w.c||p.c===w.c+1)&&(p.r===w.r||p.r===w.r+1));}
/** Deliberately small grammar; no fuzzy or ambiguous natural-language parsing. */
export function describeCells(text,s){const input=text.trim().toLowerCase();const cells=Array.from({length:81},(_,i)=>({r:Math.floor(i/9),c:i%9}));let match=input.match(/^(north|south|east|west|northeast|northwest|southeast|southwest|adjacent) of (a|b)$/);if(match){const p=s.players[match[2]==='a'?0:1];const direction=match[1];return cells.filter(q=>direction==='adjacent'?manhattan(q,p)===1:(!direction.includes('north')||q.r<p.r)&&(!direction.includes('south')||q.r>p.r)&&(!direction.includes('east')||q.c>p.c)&&(!direction.includes('west')||q.c<p.c));}if(input==='near a barrier')return cells.filter(p=>nearWall(p,s.walls));match=input.match(/^goal (a|b)$/);if(match)return cells.filter(p=>p.r===(match[1]==='a'?0:8));match=input.match(/^row ([0-8]) column ([0-8])$/);if(match)return [{r:+match[1],c:+match[2]}];throw new Error('Use a documented expression below.');}
export function demoState(){const s=initialState();s.players=[{r:4,c:3},{r:4,c:5}];s.walls=[{r:0,c:3,o:'v'},{r:2,c:3,o:'v'},{r:4,c:3,o:'v'},{r:6,c:3,o:'v'}];s.remaining=[8,8];return s;}

/** A full BFS field, indexed by row * SIZE + column. null means unreachable. */
export function distanceField(origin, walls = []) {
  const distances = Array(SIZE * SIZE).fill(null);
  const queue = [{ ...origin }];
  distances[origin.r * SIZE + origin.c] = 0;
  for (let head = 0; head < queue.length; head++) {
    const cell = queue[head];
    for (const next of neighbors(cell, walls)) {
      const index = next.r * SIZE + next.c;
      if (distances[index] !== null) continue;
      distances[index] = distances[cell.r * SIZE + cell.c] + 1;
      queue.push(next);
    }
  }
  return distances;
}

/** Explicit reachability transitions avoid subtracting infinities. */
export function fieldDifference(before, after) {
  return after.map((value, index) => {
    const previous = before[index];
    if (previous === null && value === null) return 'unreachable';
    if (value === null) return 'lost';
    if (previous === null) return 'gained';
    return value - previous;
  });
}

export function compass(location, reference) {
  const vertical = location.r < reference.r ? 'North' : location.r > reference.r ? 'South' : '';
  const horizontal = location.c < reference.c ? 'west' : location.c > reference.c ? 'east' : '';
  const direction = vertical + horizontal;
  return direction ? direction[0].toUpperCase() + direction.slice(1) : 'Same location';
}

export function boundaryDescription(p) {
  const edges = [];
  if (p.r === 0) edges.push('north');
  if (p.r === 8) edges.push('south');
  if (p.c === 0) edges.push('west');
  if (p.c === 8) edges.push('east');
  return edges.length ? `On the ${edges.join(' and ')} boundary.` : `Interior: ${p.r} rows from north, ${8-p.r} from south; ${p.c} columns from west, ${8-p.c} from east.`;
}

export function barrierEdges(w) {
  return [0, 1].map(offset => w.o === 'h'
    ? [{ r:w.r, c:w.c+offset }, { r:w.r+1, c:w.c+offset }]
    : [{ r:w.r+offset, c:w.c }, { r:w.r+offset, c:w.c+1 }]);
}

/** Geometric lower bound at every cell, ignoring the connectivity graph. */
export function manhattanField(origin) {
  return Array.from({ length: SIZE * SIZE }, (_, index) =>
    manhattan(origin, { r: Math.floor(index / SIZE), c: index % SIZE }));
}

export function detourField(origin, walls = []) {
  const geometric = manhattanField(origin);
  return distanceField(origin, walls).map((distance, index) =>
    distance === null ? null : distance - geometric[index]);
}

/** Reachability transitions count as affected, but never enter finite averages. */
export function comparisonStats(before, after) {
  const differences = fieldDifference(before, after);
  const increases = differences.filter(value => typeof value === 'number' && value > 0);
  return {
    affected: differences.filter(value => typeof value === 'number'
      ? value !== 0 : value === 'lost' || value === 'gained').length,
    maxIncrease: increases.length ? Math.max(...increases) : 0,
    averageIncrease: increases.length ? increases.reduce((sum, value) => sum + value, 0) / increases.length : 0,
    reachableAffected: increases.length,
    newlyUnreachable: differences.filter(value => value === 'lost').length,
  };
}

/** Goal distance is the minimum to ANY cell on the winning boundary. */
export function shortestGoalPath(state, playerIndex) {
  return bfs(state.players[playerIndex], cell => cell.r === (playerIndex === 0 ? 0 : 8), state.walls);
}
