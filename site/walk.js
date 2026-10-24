import {addBicycle} from './bicycle.js';
import {walkSurface} from './walk-surfaces.js';
import * as THREE from 'three';
export function createWalkMode({camera,controls,canvas,campus,buildings,stairs,onEnter}){
 const enter=document.querySelector('#walk-enter'),hud=document.querySelector('#walk-hud'),cross=document.querySelector('#walk-crosshair'),keys=new Set();
 let active=false,last=0,yaw=-Math.PI/2,pitch=0,saved,ground=.15;
 const bike=addBicycle(campus),benches=Array.from({length:8},(_,i)=>({x:106,z:150+i*13}));
 let posture='stand',standing=null,riding=false;
 const note=document.querySelector('#walk-action-note');
 const say=text=>note.textContent=text;
 function resetPosture(){posture='stand';if(standing){camera.position.copy(standing);standing=null;}document.querySelector('#walk-sit').textContent='坐下 C';document.querySelector('#walk-lie').textContent='躺下 Z';}
 function onStairs(x,z,margin=0){return stairs.some(s=>Math.abs(x-s.x)<=s.w/2+margin&&Math.abs(z-s.z)<=s.length/2+margin)||(x>197-margin&&x<205+margin&&((z>69-margin&&z<135+margin)||(z>148-margin&&z<218+margin)))||(x>159-margin&&x<186+margin&&z>134-margin&&z<140+margin);}
 function sit(){if(!active)return;if(posture==='sit'){resetPosture();say('已站起');return;}if(riding||posture!=='stand'){say('请先下车或站起');return;}const x=camera.position.x+166,z=camera.position.z+140,b=benches.find(b=>Math.hypot(x-b.x,z-b.z)<1.8);standing=camera.position.clone();if(b){camera.position.x=b.x-166;camera.position.z=b.z-140;camera.position.y=1.45;}else camera.position.y=ground+.8;posture='sit';keys.clear();document.querySelector('#walk-sit').textContent='站起 C';say('坐着休息 · 可转头 · C 站起');}
 function lie(){if(!active)return;if(posture==='lie'){resetPosture();say('已站起');return;}if(riding||posture!=='stand'){say('请先下车或站起');return;}const x=camera.position.x+166,z=camera.position.z+140;if(ground>.4||onStairs(x,z,1.2)||benches.some(b=>Math.hypot(x-b.x,z-b.z)<2.5)||[[-1,0],[1,0],[0,-1],[0,1]].some(([dx,dz])=>blocked(x+dx,z+dz)||Math.abs(surface(x+dx,z+dz)-ground)>.15)){say('请在远离板凳和台阶的平坦空地躺下');return;}standing=camera.position.clone();posture='lie';keys.clear();camera.position.y=ground+.25;pitch=.65;orient();document.querySelector('#walk-lie').textContent='起身 Z';say('躺着休息 · 可转头 · Z 起身');}
 function ride(){if(!active)return;if(posture!=='stand'){say('请先站起');return;}if(riding){const x=camera.position.x+166,z=camera.position.z+140;const options=[[-1,0],[1,0],[0,1],[0,-1]];const spot=options.find(([dx,dz])=>!blocked(x+dx,z+dz)&&Math.abs(surface(x+dx,z+dz)-ground)<.3);if(!spot){say('旁边空间不足，请换个位置下车');return;}riding=false;bike.visible=true;camera.position.x+=spot[0];camera.position.z+=spot[1];camera.position.y=ground+1.65;say('已下车 · 靠近自行车按 F 骑行');}else{if(Math.hypot(camera.position.x+166-bike.position.x,camera.position.z+140-bike.position.z)>2.5){say('靠近校门出生点的自行车，再按 F 上车');return;}riding=true;camera.position.set(bike.position.x-166,bike.position.y+1.6,bike.position.z-140);ground=bike.position.y;say('骑行中 · F 下车');}}
 document.querySelector('#walk-sit').onclick=sit;document.querySelector('#walk-lie').onclick=lie;document.querySelector('#walk-bike').onclick=ride;
 document.addEventListener('keydown',e=>{if(active&&document.pointerLockElement===canvas&&!e.repeat){if(e.code==='KeyC')sit();if(e.code==='KeyZ')lie();if(e.code==='KeyF')ride();}});
 const angles=new THREE.Euler(0,0,0,'YXZ');
 function fold(collapsed){document.body.classList.toggle('panel-collapsed',collapsed);const p=document.querySelector('#campus-panel'),b=document.querySelector('#panel-toggle');p.inert=collapsed;p.setAttribute('aria-hidden',String(collapsed));b.setAttribute('aria-expanded',String(!collapsed));b.textContent=collapsed?'›':'‹';b.title=b.ariaLabel=collapsed?'展开控制面板':'收起控制面板';}
 function home(){resetPosture();riding=false;bike.visible=true;bike.position.set(17,.15,164);say('C 坐下 · Z 躺下 · 靠近自行车按 F 上下车');camera.position.set(14-166,1.8,164-140);yaw=-Math.PI/2;pitch=0;ground=.15;orient();}
 function orient(){angles.set(pitch,yaw,0);camera.quaternion.setFromEuler(angles);}
 async function lock(){try{await canvas.requestPointerLock();}catch{document.querySelector('#walk-resume').textContent='点击继续行走';}}
 function exit(){if(!active)return;resetPosture();riding=false;bike.visible=true;active=false;keys.clear();document.exitPointerLock();controls.enabled=true;camera.position.copy(saved.pos);camera.quaternion.copy(saved.quat);controls.target.copy(saved.target);camera.fov=saved.fov;camera.near=saved.near;camera.filmOffset=saved.offset;camera.updateProjectionMatrix();fold(saved.folded);hud.hidden=cross.hidden=true;document.body.classList.remove('walking');}
 enter.onclick=()=>{if(active){lock();return;}saved={pos:camera.position.clone(),quat:camera.quaternion.clone(),target:controls.target.clone(),fov:camera.fov,near:camera.near,offset:camera.filmOffset,folded:document.body.classList.contains('panel-collapsed')};active=true;onEnter();controls.enabled=false;controls.autoRotate=false;document.querySelector('#rotate').setAttribute('aria-pressed','false');camera.fov=70;camera.near=.06;camera.filmOffset=0;camera.updateProjectionMatrix();home();last=0;fold(true);hud.hidden=false;document.body.classList.add('walking');lock();};
 document.querySelector('#walk-exit').onclick=exit;document.querySelector('#walk-home').onclick=()=>{home();lock();};document.querySelector('#walk-resume').onclick=lock;
 canvas.addEventListener('click',()=>{if(active&&!document.pointerLockElement)lock();});
 document.addEventListener('pointerlockchange',()=>{keys.clear();const locked=document.pointerLockElement===canvas;cross.hidden=!active||!locked;document.querySelector('#walk-resume').hidden=locked;if(active)fold(locked);});
 document.addEventListener('mousemove',e=>{if(active&&document.pointerLockElement===canvas){yaw-=e.movementX*.002;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.002,-1.45,1.45);orient();}});
 document.addEventListener('keydown',e=>{if(active&&document.pointerLockElement===canvas&&['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){keys.add(e.code);e.preventDefault();}});
 document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
 function blocked(x,z){if(x<6||x>328||z<6||z>272)return true;for(const b of buildings)if(ground>=(b.minFeet||0)&&Math.abs(x-b.x)<b.w/2+.45&&Math.abs(z-b.z)<b.d/2+.45)return true;if(Math.hypot(x-117,z-98)<26.5)return true;return false;}
 function surface(x,z){return walkSurface(x,z,ground,stairs);}
 function update(now){const dt=last?Math.min((now-last)/1000,.04):0;last=now;if(document.pointerLockElement!==canvas||posture!=='stand')return;let f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),r=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));const n=Math.hypot(f,r);if(!n)return;f/=n;r/=n;const speed=(riding?7:(keys.has('ShiftLeft')||keys.has('ShiftRight')?5:2.8))*dt;let x=camera.position.x+166,z=camera.position.z+140;const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*r)*speed,dz=(-Math.cos(yaw)*f-Math.sin(yaw)*r)*speed;
 if(!blocked(x+dx,z)&&surface(x+dx,z)<=ground+(riding?.18:.5))x+=dx;
 if(!blocked(x,z+dz)&&surface(x,z+dz)<=ground+(riding?.18:.5))z+=dz;
 ground=surface(x,z);camera.position.x=x-166;camera.position.z=z-140;camera.position.y=THREE.MathUtils.lerp(camera.position.y,ground+1.65,Math.min(1,dt*14));if(riding){bike.position.set(x,ground,z);bike.rotation.y=yaw;}}
 return {update,exit,get active(){return active;}};
}
