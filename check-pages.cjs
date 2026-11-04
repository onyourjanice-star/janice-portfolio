const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'dist');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'content.js'),'utf8'),context);
const data=context.window.PORTFOLIO;
const files=new Set();
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(!/^(?:https:|mailto:|data:)/.test(match[1]))files.add(match[1]);
}
for(const match of (app+JSON.stringify(data)).matchAll(/assets\/[\w.-]+/g))files.add(match[0]);
for(const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){
  if(!match[1].startsWith('data:'))files.add(match[1]);
}
for(const file of files){
  assert(!file.startsWith('/'),'Use relative paths for repository-hosted Pages: '+file);
  assert(fs.existsSync(path.join(root,file)),'Missing public asset: '+file);
  for(const base of ['https://example.github.io/','https://example.github.io/janice-portfolio/']){
    assert(new URL(file,base).href.startsWith(base),'Asset escapes Pages base: '+file);
  }
}
const links=[...data.accounts.map(a=>a.url),...data.projects.flatMap(p=>[
  ...(p.contentExamples||[]).map(e=>e.url),
  ...(p.videos||[]).map(v=>v.url),
  ...(p.ugcVideo?[p.ugcVideo.url]:[])
])];
for(const link of links)assert.equal(new URL(link).protocol,'https:','External URL must use HTTPS');
assert(fs.existsSync(path.join(root,'.nojekyll')));
assert(!/https?:\/\/(?:127\.0\.0\.1|localhost)/.test(html+app+css),'Local preview URL must not enter the public site');
console.log(`PASS: ${files.size} local files work under root and repository paths; ${links.length} external HTTPS links are well formed. External platform playback is not tested here.`);
