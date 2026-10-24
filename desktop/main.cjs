const {app,BrowserWindow,protocol,net,session,dialog}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
protocol.registerSchemesAsPrivileged([{scheme:'campus',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
app.setName('重游校园');
const smoke=process.argv.includes('--smoke-test');
let win;
function log(...args){try{fs.appendFileSync(path.join(app.getPath('userData'),'desktop.log'),args.map(String).join(' ')+'\n');}catch{}}
app.whenReady().then(async()=>{
 const site=path.join(__dirname,'..','site');
 protocol.handle('campus',request=>{
  const url=new URL(request.url);
  if(url.host!=='app')return new Response('Not found',{status:404});
  let filename;try{filename=path.resolve(site,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));}catch{return new Response('Bad request',{status:400});}
  if(!filename.startsWith(site+path.sep))return new Response('Forbidden',{status:403});
  try{const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mp3':'audio/mpeg'};return new Response(fs.readFileSync(filename),{headers:{'Content-Type':mime[path.extname(filename)]||'application/octet-stream'}});}catch{return new Response('Not found',{status:404});}
 });
 session.defaultSession.setPermissionRequestHandler((_wc,permission,callback)=>callback(permission==='pointerLock'));
 session.defaultSession.setPermissionCheckHandler((_wc,permission)=>permission==='pointerLock');
 session.defaultSession.webRequest.onBeforeRequest((details,callback)=>callback({cancel:!['campus:','data:','blob:','devtools:'].includes(new URL(details.url).protocol)}));
 win=new BrowserWindow({width:1440,height:960,minWidth:900,minHeight:650,show:!smoke,title:'重游校园，再见少年。',backgroundColor:'#dce5e7',autoHideMenuBar:true,webPreferences:{autoplayPolicy:'no-user-gesture-required',nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
 win.setMenu(null);
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('campus://app/'))event.preventDefault();});
 win.webContents.on('did-fail-load',(_e,code,desc)=>{log('LOAD_FAILED',code,desc);if(smoke)app.exit(1);});
 win.webContents.on('render-process-gone',(_e,details)=>{log('RENDERER_FAILED',details.reason);if(smoke)app.exit(1);});
 win.webContents.on('console-message',(_e,level,message)=>{if(level>=3)log('RENDERER_ERROR',message);});
 session.defaultSession.on('will-download',(_event,item)=>{item.setSaveDialogOptions({title:'保存校园文件',defaultPath:path.join(app.getPath('downloads'),item.getFilename())});});
 await win.loadURL('campus://app/');
 if(smoke){setTimeout(async()=>{try{const shot=await win.webContents.capturePage();fs.writeFileSync(path.join(process.cwd(),'campus-desktop-smoke.png'),shot.toPNG());log('CAMPUS_DESKTOP_LOADED');app.quit();}catch(e){log(e);app.exit(1);}},8000);}
}).catch(e=>{log(e);app.exit(1);});
app.on('window-all-closed',()=>app.quit());
