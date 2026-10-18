#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative, resolve } from 'node:path';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const failures=[];
const skip=new Set(['.git','node_modules','dist']);
const textFiles=[];

async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    if(skip.has(entry.name))continue;
    const path=join(dir,entry.name);
    if(entry.isDirectory())await walk(path);
    else if(entry.isSymbolicLink())failures.push(relative(root,path)+': symlinks are not accepted in repository source');
    else if(entry.isFile())textFiles.push(path);
  }
}
await walk(root);

const packageJson=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
if(Object.keys(packageJson.dependencies??{}).length)failures.push('Runtime dependencies must remain empty');
if(Object.keys(packageJson.devDependencies??{}).length)failures.push('Dev dependencies must remain empty');
if(packageJson.license!=='MIT')failures.push('package.json must declare MIT license');

const relativeUnix = (path) => relative(root, path).replaceAll('\\', '/');
const runtime=textFiles.filter(p=>/\.(mjs|js|html)$/.test(p)&&relativeUnix(p)!=='scripts/security-audit.mjs');
for(const path of runtime){
  const source=await readFile(path,'utf8');
  const rel=relativeUnix(path);
  const banned=[
    [/\beval\s*\(/,'eval'],
    [/new\s+Function\b/,'new Function'],
    [/\.innerHTML\s*=/,'innerHTML assignment'],
    [/document\.write\s*\(/,'document.write'],
    [/shell\s*:\s*true/,'shell:true'],
    [/from\s+['"]node:(?:http|https|net|tls|dgram)['"]/,'network module'],
    [/\bfetch\s*\(/,'fetch'],
    [/\bXMLHttpRequest\b/,'XMLHttpRequest'],
    [/\bWebSocket\b/,'WebSocket'],
  ];
  for(const [pattern,label] of banned)if(pattern.test(source))failures.push(`${rel}: banned ${label}`);
}

const server=await readFile(join(root,'server/index.mjs'),'utf8');
for(const required of [
  'destructiveHint: false',
  'openWorldHint: false',
  'connectDomains: []',
  'resourceDomains: []',
  'MAX_MCP_LINE_BYTES',
  'validateToolArguments',
])if(!server.includes(required))failures.push('server/index.mjs missing security control: '+required);

const license=await readFile(join(root,'LICENSE'),'utf8');
for(const required of [
  'MIT License',
  'Copyright (c) 2026 Cibersecurity-H',
  'Permission is hereby granted, free of charge',
  'The above copyright notice and this permission notice shall be included',
  'THE SOFTWARE IS PROVIDED "AS IS"',
])if(!license.includes(required))failures.push('LICENSE missing MIT requirement: '+required);

const owners=await readFile(join(root,'.github/CODEOWNERS'),'utf8');
for(const required of ['* @csecurh','/.github/ @csecurh','/LICENSE @csecurh'])
  if(!owners.includes(required))failures.push('CODEOWNERS missing '+required);

const dependabot=await readFile(join(root,'.github/dependabot.yml'),'utf8');
for(const required of ['version: 2','package-ecosystem: github-actions','interval: weekly'])
  if(!dependabot.includes(required))failures.push('Dependabot configuration missing: '+required);

const workflow=await readFile(join(root,'.github/workflows/ci.yml'),'utf8');
if(!/actions\/checkout@[a-f0-9]{40}/.test(workflow))failures.push('checkout action must be pinned by full SHA');
if(!/actions\/setup-node@[a-f0-9]{40}/.test(workflow))failures.push('setup-node action must be pinned by full SHA');
if(/npm\s+(?:ci|install)/.test(workflow))failures.push('CI must not install dependencies for dependency-free plugin');
if(!/persist-credentials:\s*false/.test(workflow))failures.push('checkout must disable credential persistence');
if(!/permissions:\s*\n\s*contents:\s*read/.test(workflow))failures.push('CI must have read-only permissions');
if(/pull_request_target\s*:/.test(workflow))failures.push('CI must not run with pull_request_target');
if(!/^\s*pull_request\s*:/m.test(workflow))failures.push('CI must validate pull requests');
if(!/ubuntu-latest.*macos-latest.*windows-latest/.test(workflow))failures.push('CI must retain three-platform matrix');
const actionCalls=[...workflow.matchAll(/^\s*uses:\s*([^\s#]+)/gm)].map(match=>match[1]);
if(actionCalls.length<2)failures.push('CI must run expected GitHub-owned actions');
for(const action of actionCalls){
  if(!/^actions\/(?:checkout|setup-node|upload-artifact|download-artifact)@[a-f0-9]{40}$/.test(action))
    failures.push('CI contains unexpected or unpinned action');
}

const widget=await readFile(join(root,'ui/quota-widget.html'),'utf8');
for(const requirement of ["connect-src 'none'", "default-src 'none'", "base-uri 'none'", "form-action 'none'"]){
  if(!widget.includes(requirement))failures.push('widget missing restrictive CSP directive: '+requirement);
}
if(!widget.includes("window.openai.callTool('get_overview'"))failures.push('widget must use only the MCP host bridge');
const secureFs=await readFile(join(root,'scripts/secure-fs.mjs'),'utf8');
if(!secureFs.includes('O_NOFOLLOW'))failures.push('safe reader missing no-follow protection');
if(!secureFs.includes('randomUUID'))failures.push('atomic writes must use unpredictable temp names');

const secretPatterns=[
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /ghp_[A-Za-z0-9]{30,}/,
  /sk-[A-Za-z0-9_-]{24,}/,
  /AKIA[0-9A-Z]{16}/,
  /sb_secret_[A-Za-z0-9_-]{16,}/,
];
for(const path of textFiles.filter(p=>relativeUnix(p)!=='scripts/security-audit.mjs')){
  const source=await readFile(path,'utf8');
  for(const pattern of secretPatterns){
    if(pattern.test(source))failures.push(relative(root,path)+': possible committed secret');
  }
}

const allPaths=textFiles.map(relativeUnix);
for(const path of allPaths){
  if(/(^|\/)\.env$/.test(path)||/\.(?:pem|key|p12|pfx)$/.test(path))failures.push('Sensitive file type committed: '+path);
}

if(failures.length){
  for(const failure of failures)process.stderr.write('[security] '+failure+'\n');
  process.exitCode=1;
}else{
  process.stdout.write('Security audit OK: dependency-free, no network egress, no dangerous DOM/runtime primitives, CI pinned, no obvious secrets.\n');
}
