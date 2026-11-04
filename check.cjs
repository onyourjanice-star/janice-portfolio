const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname,'dist');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'content.js'),'utf8'),context);
const projects = context.window.PORTFOLIO.projects;
assert.equal(projects.length,5);
assert.equal(new Set(projects.map(p=>p.id)).size,5);
assert.deepEqual(Array.from(projects,p=>p.id),['xiaomi','futu','nova','heritage','baike']);
const data=context.window.PORTFOLIO;
assert.equal(data.accounts.length,5);
assert.equal(data.accounts.filter(a=>a.kind==='incubated' && a.role==='独立孵化').length,2);
assert.equal(data.accounts.filter(a=>a.kind==='operated' && a.role.includes('参与运营')).length,2);
assert.equal(new Set(data.accounts.map(a=>a.url)).size,5);
assert.equal(data.accounts.filter(a=>a.kind==='personal').length,1);
for(const account of data.accounts){
  const url=new URL(account.url);
  assert(['www.xiaohongshu.com','www.douyin.com'].includes(url.hostname));
  assert.equal((account.url.match(/https:\/\//g)||[]).length,1,'Concatenated account URLs must be separated');
}
assert.equal(new URL(projects.find(p=>p.id==='nova').video.url).hostname,'v.douyin.com');
const nova=projects.find(p=>p.id==='nova');
const futu=projects.find(p=>p.id==='futu');
assert.equal(futu.contentExamples.length,3);
assert.equal(new Set(futu.contentExamples.map(e=>e.url)).size,3);
assert(futu.contentExamples.every(e=>new URL(e.url).hostname==='www.xiaohongshu.com'));
assert.equal(futu.contentReview.tutorial.metrics[2][0],'62%');
assert.equal(futu.contentReview.cases[0][1],'7332');
assert.equal(futu.contentReview.cases[2][1],'497');
assert(futu.contentReview.note.includes('下架'));
for(const [image] of futu.contentReview.images)assert(fs.existsSync(path.join(root,image)));
assert.equal(nova.videos.length,3);
assert(nova.videos.every(v=>v.role==='本人制作与剪辑'));
assert.equal(nova.ugcVideo.url,'https://v.douyin.com/ZAW6jmmfAn0/');
assert(nova.ugcVideo.role.includes('UGC创作者制作'));
assert.equal(new Set([...nova.videos,nova.ugcVideo].map(v=>v.url)).size,4);
assert.equal(nova.topic.value,'7005.3万');
assert(nova.topic.note.includes('不等同于本人作品播放量'));
assert(fs.existsSync(path.join(root,nova.topic.image)));
for(const v of [...nova.videos,nova.ugcVideo]){
  assert.equal(new URL(v.url).hostname,'v.douyin.com');
  assert(fs.existsSync(path.join(root,v.poster)));
}
for(const p of projects){
  assert(p.role && p.source && p.resultNote, `${p.id}: missing attribution or data scope`);
  assert(p.metrics.length===3 && p.sop.length>=3, `${p.id}: incomplete content`);
  assert(p.stories.length && p.stories.every(s=>s.heading && s.body),`${p.id}: missing updated case copy`);
  for(const image of [p.cover,...p.gallery.map(g=>g[0])].filter(Boolean))assert(fs.existsSync(path.join(root,image)),`${p.id}: missing image ${image}`);
}
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+\.(?:css|js))"/g))assert(fs.existsSync(path.join(root,match[1])));
const names=fs.readdirSync(root,{recursive:true}).map(String);
assert(!names.some(p=>/\.(pdf|docx|xlsx|pptx)$/i.test(p)),'Raw private documents must not enter web assets');
assert(!names.some(p=>p.includes('materials')),'Research data must not enter web assets');
const appSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
const noteStart=appSource.indexOf('  function markdownNotes('),noteEnd=appSource.indexOf('\n  function videoCard(',noteStart);
const notes=vm.runInNewContext('const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");'+appSource.slice(noteStart,noteEnd)+';markdownNotes');
assert.equal(notes('**重点**\n\n- 流程\n- 反馈'),'<p><strong>重点</strong></p><ul><li>流程</li><li>反馈</li></ul>');
assert(notes('<script>example</script>').includes('&lt;script&gt;'));
assert(appSource.includes("hash==='#/lab'"));
assert(appSource.includes("match[1]==='creative'?'nova'"),'Keep existing creative-case links working');
console.log('PASS: five projects, five account links, three edited videos, separate Prompt-driven UGC, scoped topic results, escaped Markdown, assets and legacy route.');
