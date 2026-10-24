const toggle=document.getElementById('panel-toggle');
const panel=document.getElementById('campus-panel');
toggle.addEventListener('click',()=>{
 const collapsed=document.body.classList.toggle('panel-collapsed');
 panel.inert=collapsed;
 panel.setAttribute('aria-hidden',String(collapsed));
 toggle.setAttribute('aria-expanded',String(!collapsed));
 toggle.textContent=collapsed?'›':'‹';
 toggle.title=toggle.ariaLabel=collapsed?'展开控制面板':'收起控制面板';
});
