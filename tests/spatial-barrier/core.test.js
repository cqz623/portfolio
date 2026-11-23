// Upstream core tests, commit 729ce505c3cb65277c0a54a2e5b4dbf71ca2db6c. Only the import path is adapted.
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,legalMoves,act,wallError,bfs,manhattan,manhattanPath,describeCells,relative,nearWall,gridToScreen,screenToGrid,demoState,blocked} from '../../static/interactive/spatial-barrier-game/core.js';
test('initial board, legal movement and alternating turns',()=>{const s=initialState();assert.equal(legalMoves(s).length,3);const next=act(s,{type:'move',to:{r:7,c:4}}).state;assert.equal(next.turn,1);assert.deepEqual(next.players[0],{r:7,c:4});assert.deepEqual(s.players[0],{r:8,c:4});assert.ok(act(s,{type:'move',to:{r:6,c:4}}).error);});
test('adjacent pawns block entry with no jumps or diagonals',()=>{const s=initialState();s.players=[{r:4,c:4},{r:3,c:4}];assert.equal(legalMoves(s).length,3);for(const p of [{r:3,c:4},{r:2,c:4},{r:3,c:3}])assert.ok(act(s,{type:'move',to:p}).error);});
test('horizontal and vertical barriers block exactly two edges',()=>{assert.ok(blocked({r:3,c:2},{r:4,c:2},[{r:3,c:2,o:'h'}]));assert.ok(blocked({r:3,c:3},{r:4,c:3},[{r:3,c:2,o:'h'}]));assert.ok(!blocked({r:3,c:4},{r:4,c:4},[{r:3,c:2,o:'h'}]));assert.ok(blocked({r:3,c:2},{r:3,c:3},[{r:3,c:2,o:'v'}]));assert.ok(blocked({r:4,c:2},{r:4,c:3},[{r:3,c:2,o:'v'}]));});
test('placement consumes a barrier, switches turn and blocks movement',()=>{let s=initialState();s=act(s,{type:'wall',wall:{r:7,c:4,o:'h'}}).state;assert.deepEqual(s.remaining,[9,10]);assert.equal(s.turn,1);s.turn=0;assert.ok(!legalMoves(s).some(p=>p.r===7&&p.c===4));});
test('reject overlap, crossing, invalid coordinates and empty inventory',()=>{const s=initialState();s.walls=[{r:3,c:3,o:'h'}];for(const wall of [{r:3,c:3,o:'h'},{r:3,c:2,o:'h'},{r:3,c:4,o:'h'},{r:3,c:3,o:'v'},{r:8,c:0,o:'h'},{r:1.5,c:2,o:'h'}])assert.ok(wallError(s,wall));assert.equal(wallError(s,{r:3,c:5,o:'h'}),null);s.remaining[0]=0;assert.ok(wallError(s,{r:0,c:0,o:'v'}));});
test('path preservation rejects enclosure of either pawn',()=>{for(const player of [0,1]){const s=initialState();s.players[player]={r:player===0?8:0,c:0};s.walls=[{r:player===0?7:0,c:0,o:'v'}];assert.match(wallError(s,{r:player===0?6:1,c:0,o:'h'}),/retain a path/);}});
test('win detection prevents further moves or walls',()=>{const s=initialState();s.players[0]={r:1,c:0};const n=act(s,{type:'move',to:{r:0,c:0}}).state;assert.equal(n.winner,0);assert.deepEqual(legalMoves(n),[]);assert.ok(wallError(n,{r:2,c:2,o:'h'}));});
test('Manhattan and open-board BFS, including same endpoints',()=>{const a={r:0,c:1},b={r:8,c:7};assert.equal(manhattan(a,b),14);assert.equal(bfs(a,b).length-1,14);assert.equal(manhattanPath(a,b).length,15);assert.equal(bfs(a,a).length,1);assert.equal(bfs(a,()=>false),null);});
test('detour demo gives reproducible 2 versus 10 steps and reachable goals',()=>{const s=demoState();assert.equal(manhattan(...s.players),2);assert.equal(bfs(...s.players,s.walls).length-1,10);s.players.forEach((p,i)=>assert.ok(bfs(p,q=>q.r===(i?8:0),s.walls)));});
test('distance recalculates after a barrier placement',()=>{const s=initialState(),a={r:4,c:4},b={r:5,c:4};assert.equal(bfs(a,b,s.walls).length-1,1);const n=act(s,{type:'wall',wall:{r:4,c:4,o:'h'}}).state;assert.equal(bfs(a,b,n.walls).length-1,3);});
test('location grammar, relations, occupancy and proximity',()=>{const s=initialState();assert.equal(describeCells('north of A',s).length,72);assert.equal(describeCells('south of B',s).length,72);assert.equal(describeCells('east of A',s).length,36);assert.equal(describeCells('west of B',s).length,36);assert.equal(describeCells('goal A',s).length,9);assert.deepEqual(describeCells('row 3 column 4',s),[{r:3,c:4}]);assert.throws(()=>describeCells('somewhere',s));assert.equal(relative(s.players[0],s.players[1]),'8 row(s) south');s.walls=[{r:2,c:2,o:'h'}];assert.ok(nearWall({r:3,c:3},s.walls));assert.equal(describeCells('near a barrier',s).length,4);});
test('grid-screen coordinate round trip and outside bounds',()=>{const rect={left:53,top:101,width:450,height:630};for(let r=0;r<9;r++)for(let c=0;c<9;c++){const p={r,c};assert.deepEqual(screenToGrid(gridToScreen(p,rect),rect),p);}assert.equal(screenToGrid({x:503,y:101},rect),null);assert.equal(screenToGrid({x:52,y:101},rect),null);});
test('snapshot undo and reset restore independent state',()=>{const start=initialState(),history=[structuredClone(start)];let s=act(start,{type:'move',to:{r:7,c:4}}).state;s=history.pop();assert.deepEqual(s,initialState());s.walls.push({r:2,c:2,o:'h'});s=initialState();assert.equal(s.walls.length,0);assert.deepEqual(s.remaining,[10,10]);});

import {distanceField,fieldDifference,compass,boundaryDescription,barrierEdges} from '../../static/interactive/spatial-barrier-game/core.js';
test('full BFS field equals Manhattan on an open board',()=>{
 const origin={r:4,c:4},field=distanceField(origin);
 assert.equal(field.length,81);
 for(let r=0;r<9;r++)for(let c=0;c<9;c++)assert.equal(field[r*9+c],manhattan(origin,{r,c}));
});
test('heatmap field agrees with every BFS shortest path for both orientations',()=>{
 for(const o of ['h','v']){
  const walls=[{r:3,c:3,o}],origin={r:3,c:3},field=distanceField(origin,walls);
  for(let r=0;r<9;r++)for(let c=0;c<9;c++)assert.equal(field[r*9+c],bfs(origin,{r,c},walls).length-1);
  for(const [a,b] of barrierEdges(walls[0]))assert.ok(blocked(a,b,walls));
 }
});
test('barrier comparison keeps coordinates and Manhattan fixed but increases BFS',()=>{
 const s=initialState(),origin={r:4,c:4},target={r:5,c:4};
 const before=distanceField(origin,s.walls),next=act(s,{type:'wall',wall:{r:4,c:4,o:'h'}}).state;
 const after=distanceField(origin,next.walls),difference=fieldDifference(before,after);
 assert.deepEqual(s.players,next.players);assert.equal(manhattan(origin,target),1);
 assert.equal(before[49],1);assert.equal(after[49],3);assert.equal(difference[49],2);assert.equal(difference[40],0);
 assert.ok(difference.every(d=>typeof d==='number'&&d>=0));
});
test('unreachable fields and reachability transitions use explicit markers',()=>{
 const walls=[{r:0,c:0,o:'v'},{r:1,c:0,o:'h'}];
 const before=distanceField({r:4,c:4}),after=distanceField({r:4,c:4},walls);
 assert.equal(after[0],null);assert.equal(fieldDifference(before,after)[0],'lost');
 assert.equal(fieldDifference(after,after)[0],'unreachable');assert.equal(fieldDifference(after,before)[0],'gained');
 assert.equal(distanceField({r:0,c:0},walls)[0],0);
});
test('semantic compass supports all eight directions, adjacency and boundaries',()=>{
 const origin={r:4,c:4};
 for(const [r,c,name] of [[3,4,'North'],[5,4,'South'],[4,5,'East'],[4,3,'West'],[3,5,'Northeast'],[3,3,'Northwest'],[5,5,'Southeast'],[5,3,'Southwest']])assert.equal(compass({r,c},origin),name);
 assert.equal(compass(origin,origin),'Same location');
 const s=initialState();s.players[0]=origin;
 assert.equal(describeCells('northeast of A',s).length,16);
 assert.equal(describeCells('adjacent of A',s).length,4);
 assert.match(boundaryDescription({r:0,c:8}),/north and east/);
});
test('undo/reset topology snapshots reproduce exact fields and differences',()=>{
 const s=initialState(),origin=s.players[0],before=distanceField(origin,s.walls);
 const snapshot=structuredClone(s),next=act(s,{type:'wall',wall:{r:7,c:4,o:'h'}}).state;
 assert.notDeepEqual(distanceField(origin,next.walls),before);
 assert.deepEqual(distanceField(origin,snapshot.walls),before);
 assert.deepEqual(distanceField(origin,initialState().walls),before);
 assert.ok(fieldDifference(before,distanceField(origin,snapshot.walls)).every(n=>n===0));
});
test('vertical barrier placement uses current orientation and rejects crossing',()=>{
 let s=act(initialState(),{type:'wall',wall:{r:3,c:4,o:'v'}}).state;
 assert.equal(s.walls[0].o,'v');assert.equal(s.remaining[0],9);
 assert.ok(wallError(s,{r:3,c:4,o:'h'}));
 assert.equal(wallError(s,{r:5,c:4,o:'v'}),null);
});

import {manhattanField,detourField,comparisonStats,shortestGoalPath,neighbors} from '../../static/interactive/spatial-barrier-game/core.js';
test('Manhattan fields ignore barriers and have exact zero and corner values',()=>{
 const origin={r:7,c:4},field=manhattanField(origin);
 assert.equal(field[7*9+4],0);assert.equal(field[0],11);assert.equal(field[8*9+8],5);
 assert.equal(field.length,81);
});
test('detour fields use real BFS minus Manhattan for horizontal and vertical barriers',()=>{
 for(const [wall,origin,target] of [[{r:6,c:4,o:'h'},{r:7,c:4},{r:6,c:4}],[{r:6,c:4,o:'v'},{r:6,c:4},{r:6,c:5}]]){
  const geometric=manhattanField(origin),walk=distanceField(origin,[wall]),detour=detourField(origin,[wall]),index=target.r*9+target.c;
  assert.equal(geometric[index],1);assert.equal(walk[index],3);assert.equal(detour[index],2);
  assert.equal(detour[origin.r*9+origin.c],0);
  for(let i=0;i<81;i++)assert.equal(detour[i],walk[i]-geometric[i]);
 }
});
test('detour marks unreachable cells separately',()=>{
 const walls=[{r:0,c:0,o:'v'},{r:1,c:0,o:'h'}];assert.equal(detourField({r:4,c:4},walls)[0],null);
});
test('reconstructed shortest path starts and ends correctly and crosses only legal edges',()=>{
 const s=demoState(),path=bfs(...s.players,s.walls),field=distanceField(s.players[0],s.walls);
 assert.deepEqual(path[0],s.players[0]);assert.deepEqual(path.at(-1),s.players[1]);
 assert.equal(path.length-1,field[s.players[1].r*9+s.players[1].c]);
 path.slice(1).forEach((p,i)=>assert.ok(neighbors(path[i],s.walls).some(q=>q.r===p.r&&q.c===p.c)));
});
test('comparison statistics exclude unreachable transitions from finite increases',()=>{
 assert.deepEqual(comparisonStats([0,1,2,4,null],[0,3,6,null,null]),{affected:3,maxIncrease:4,averageIncrease:3,reachableAffected:2,newlyUnreachable:1});
 assert.equal(comparisonStats([0,1],[0,1]).averageIncrease,0);
 const origin={r:8,c:4},before=distanceField(origin),after=distanceField(origin,[{r:7,c:4,o:'v'}]);
 const stats=comparisonStats(before,after);assert.ok(stats.affected>0);assert.equal(stats.maxIncrease,4);assert.ok(stats.averageIncrease>0);
});
test('nearest goal routes use each winning edge, not the opponent position',()=>{
 const s=initialState();s.players=[{r:1,c:0},{r:6,c:8}];
 assert.equal(shortestGoalPath(s,0).length-1,1);assert.equal(shortestGoalPath(s,1).length-1,2);
 assert.equal(shortestGoalPath(s,0).at(-1).r,0);assert.equal(shortestGoalPath(s,1).at(-1).r,8);
 assert.notEqual(shortestGoalPath(s,0).length-1,bfs(...s.players).length-1);
 s.walls=[{r:0,c:0,o:'h'},{r:6,c:7,o:'h'}];
 assert.equal(shortestGoalPath(s,0).length-1,3);assert.equal(shortestGoalPath(s,1).length-1,4);
});
test('Undo and Reset fields restore Manhattan, BFS, detour and goal metrics',()=>{
 const start=initialState(),snapshot=structuredClone(start),origin=start.players[0];
 const placed=act(start,{type:'wall',wall:{r:7,c:4,o:'v'}}).state;
 assert.notDeepEqual(detourField(origin,placed.walls),detourField(origin,start.walls));
 for(const restored of [snapshot,initialState()]){
  assert.deepEqual(distanceField(origin,restored.walls),manhattanField(origin));
  assert.ok(detourField(origin,restored.walls).every(n=>n===0));
  assert.equal(shortestGoalPath(restored,0).length-1,8);assert.equal(shortestGoalPath(restored,1).length-1,8);
 }
});

