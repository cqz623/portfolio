import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWorkLayout, savedWorkColumns, responsiveWorkColumns } from '../src/lib/utils/work-layout.js';
import { localLayoutRequest } from '../scripts/work-layout-dev.mjs';

test('strict layout writes reject invalid, unknown, duplicate and missing project slots', () => {
  const slugs=['a','b','c'];
  assert.doesNotThrow(()=>validateWorkLayout({version:1,columns:[['b'],[],['c','a']]},slugs));
  for(const value of [null, {version:1,columns:null}, {version:2,columns:[['a'],['b'],['c']]}, {version:1,columns:[['a'],['a'],['c']]}, {version:1,columns:[['a'],[],['c']]}, {version:1,columns:[['a'],['b'],['unknown']]}, {version:1,columns:[['a'],['b'],['c']],path:'/tmp/arbitrary'}]) assert.throws(()=>validateWorkLayout(value,slugs));
});

test('saved column assignments are exact and responsive reading order is deterministic', () => {
  const columns=[['c','a'],['f'],['b','d','e']];
  assert.equal(responsiveWorkColumns(columns,3),columns);
  assert.deepEqual(responsiveWorkColumns(columns,2),[['c','a','f'],['b','d','e']]);
  assert.deepEqual(responsiveWorkColumns(columns,1),[['c','a','f','b','d','e']]);
  assert.deepEqual(savedWorkColumns({columns:[['c','old'],['a','c'],[]]},['a','b','c']),[['c'],['a'],['b']]);
  assert.equal(savedWorkColumns({columns:null},['a']),null);
});

test('write gate requires loopback socket, loopback host and matching browser origin', () => {
  const request={headers:{host:'localhost:5173',origin:'http://localhost:5173','sec-fetch-site':'same-origin'},socket:{remoteAddress:'::1'}};
  assert.equal(localLayoutRequest(request,true),true);
  for(const altered of [
    {...request,socket:{remoteAddress:'192.168.1.1'}},
    {...request,headers:{...request.headers,host:'evil.example:5173'}},
    {...request,headers:{...request.headers,origin:'http://evil.example'}},
    {...request,headers:{...request.headers,origin:undefined}},
    {...request,headers:{...request.headers,'sec-fetch-site':'cross-site'}}
  ]) assert.equal(localLayoutRequest(altered,true),false);
});
