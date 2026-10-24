import * as THREE from 'three';
import {addBasketballToy} from './basketball-toy.js';

export function createSeasons({campus,scene,M,sportMat,texture,treeLocations,ambient,sun,renderer,nightLighting,camera}){
const palettes={
spring:{label:'春',desc:'青绿新叶 · 疏朗树冠',leaves:['#77a779','#91b984','#abc88c'],density:.70,grass:'#91a878',sky:'#d7e7e7',sun:'#fff1d9'},
summer:{label:'夏',desc:'浓绿树荫 · 枝叶繁茂',leaves:['#385e42','#527645','#738b4c'],density:1,grass:'#668055',sky:'#dce5e7',sun:'#ffefd6'},
autumn:{label:'秋',desc:'金黄树叶 · 林下落叶',leaves:['#b89435','#d9b54b','#dc9843'],density:.70,grass:'#999565',sky:'#e8dfcf',sun:'#ffe1b3'},
winter:{label:'冬',desc:'枝干覆雪 · 雪花与雪人',leaves:['#adb9ae','#adb9ae','#adb9ae'],density:0,grass:'#e7eef0',sky:'#b9cbd8',sun:'#edf3ff'}
};
const leafMats=[M.leaf1,M.leaf2,M.leaf3],leafMeshes=[];
campus.traverse(o=>{if(o.isInstancedMesh&&leafMats.includes(o.material)){const originals=[];for(let i=0;i<o.count;i++){const m=new THREE.Matrix4();o.getMatrixAt(i,m);originals.push(m);}leafMeshes.push({mesh:o,originals});}});
const original={roofMap:M.roof.map,pitchMap:sportMat.map,colors:{}};
for(const key of ['grass','grass2','paving','asphalt','hedge','ridge','water'])original.colors[key]=M[key].color.clone();
const snowTexture=texture((c,w,h)=>{c.fillStyle='#e9f0f3';c.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const x=(i*83)%w,y=(i*137)%h;c.fillStyle=i%3?'#e0e8ec':'#f8fbfc';c.fillRect(x,y,1,1);}});
// Thin, uneven snow retains the actual track, court markings and grass stripes.
const winterPitchTexture=texture((c,w,h)=>{
 c.drawImage(original.pitchMap.image,0,0,w,h);
 c.fillStyle='rgba(235,242,245,.58)';c.fillRect(0,0,w,h);
 c.save();c.scale(w/122,h/272);
 // The grass holds more powder than the rubber running surface.
 const grassSnow=c.createRadialGradient(58,155,12,58,155,88);
 grassSnow.addColorStop(0,'rgba(241,246,248,.36)');grassSnow.addColorStop(1,'rgba(241,246,248,.62)');
 c.fillStyle=grassSnow;c.fillRect(14,88,88,135);
 // Soft drifts collect along the outer perimeter without hiding the lanes.
 for(const [x,z,r] of [[0,50,17],[122,80,18],[0,170,16],[122,213,18],[10,265,19],[110,265,20],[6,2,12],[100,2,12]]){
  const drift=c.createRadialGradient(x,z,0,x,z,r);drift.addColorStop(0,'rgba(246,249,250,.88)');drift.addColorStop(.45,'rgba(242,247,249,.5)');drift.addColorStop(1,'rgba(242,247,249,0)');c.fillStyle=drift;c.fillRect(x-r,z-r,r*2,r*2);
 }
 // Irregular thin patches make the surface read as snow rather than a flat tint.
 for(let i=0;i<95;i++){const x=(i*47.31)%122,z=(i*73.17)%272,r=1.5+(i%7)*.6;const patch=c.createRadialGradient(x,z,0,x,z,r);patch.addColorStop(0,'rgba(249,251,252,.18)');patch.addColorStop(1,'rgba(249,251,252,0)');c.fillStyle=patch;c.fillRect(x-r,z-r,r*2,r*2);}
 c.restore();
},1536,3072);
const winter=new THREE.Group();winter.name='Winter_decorations';winter.visible=false;campus.add(winter);
const autumn=new THREE.Group();autumn.name='Autumn_fallen_leaves';autumn.visible=false;campus.add(autumn);
let seed=9051;function rand(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
// Leaf litter is concentrated under actual trees, with open patches between clusters.
const leafShape=new THREE.Shape();leafShape.moveTo(0,-.5);leafShape.bezierCurveTo(.45,-.1,.37,.25,0,.5);leafShape.bezierCurveTo(-.37,.25,-.45,-.1,0,-.5);
const leafGeo=new THREE.ShapeGeometry(leafShape,4);leafGeo.rotateX(-Math.PI/2);
const leafMat=new THREE.MeshStandardMaterial({color:0xc49a39,roughness:.95,side:THREE.DoubleSide});
const leafCount=treeLocations.length*180,fallen=new THREE.InstancedMesh(leafGeo,leafMat,leafCount);fallen.receiveShadow=true;
const dummy=new THREE.Object3D(),color=new THREE.Color();let index=0;
for(const {x,z,s} of treeLocations){for(let j=0;j<180;j++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*4.0*s;dummy.position.set(x+Math.cos(a)*r,.34+rand()*.015,z+Math.sin(a)*r);dummy.rotation.set((rand()-.5)*.14,rand()*Math.PI*2,(rand()-.5)*.12);const size=.23+rand()*.32;dummy.scale.set(size*.7,1,size);dummy.updateMatrix();fallen.setMatrixAt(index,dummy.matrix);color.setHSL(.075+rand()*.075,.6,.34+rand()*.2);fallen.setColorAt(index++,color);}}
fallen.computeBoundingSphere();autumn.add(fallen);
// Dense but broken leaf beds remain legible from an aerial camera.
const litterMap=texture((c,w,h)=>{c.clearRect(0,0,w,h);for(let i=0;i<1500;i++){const a=rand()*6.283,r=Math.sqrt(rand())*w*.48,x=w/2+Math.cos(a)*r,y=h/2+Math.sin(a)*r;c.save();c.translate(x,y);c.rotate(rand()*6.28);c.fillStyle=['#b57b32','#c99a3b','#ddbb57','#9c6b31'][i%4];c.globalAlpha=.35+rand()*.5;c.beginPath();c.ellipse(0,0,2+rand()*2,4+rand()*3,0,0,6.283);c.fill();c.restore();}},256,256);
const litterMat=new THREE.MeshStandardMaterial({map:litterMap,transparent:true,depthWrite:false,roughness:1,opacity:.72,polygonOffset:true,polygonOffsetFactor:-1});
const litter=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),litterMat,treeLocations.length);
treeLocations.forEach(({x,z,s},i)=>{dummy.position.set(x,.335,z);dummy.rotation.set(-Math.PI/2,0,rand()*6.28);dummy.scale.set(6.5*s,6.5*s,1);dummy.updateMatrix();litter.setMatrixAt(i,dummy.matrix);});litter.receiveShadow=true;litter.computeBoundingSphere();autumn.add(litter);
// Light powder mounds at tree bases, avoiding an opaque plane through the buildings.
const snowMat=new THREE.MeshStandardMaterial({color:0xf1f5f5,roughness:.98});
const mounds=new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,8),snowMat,treeLocations.length);
treeLocations.forEach(({x,z,s},i)=>{dummy.position.set(x,.24,z);dummy.rotation.set(0,rand()*6.28,0);dummy.scale.set(.65*s,.13,.72*s);dummy.updateMatrix();mounds.setMatrixAt(i,dummy.matrix);});winter.add(mounds);
// A quiet scatter of traditional snowmen across the grass, including its centre.
const charcoal=new THREE.MeshStandardMaterial({color:0x24303a,roughness:.8});
const carrot=new THREE.MeshStandardMaterial({color:0xdc7e30,roughness:.85});
const twig=new THREE.MeshStandardMaterial({color:0x6d5545,roughness:1});
function sphere(parent,m,x,y,z,rx,ry,rz){const o=new THREE.Mesh(new THREE.SphereGeometry(1,24,18),m);o.position.set(x,y,z);o.scale.set(rx,ry,rz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function stick(parent,from,to,r=.025){const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),d=b.clone().sub(a);const o=new THREE.Mesh(new THREE.CylinderGeometry(r*.7,r,d.length(),7),twig);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(o);}
function snowman(x,z,scale,scarfColor,angle){const g=new THREE.Group();g.position.set(x,.15,z);g.scale.setScalar(scale);g.rotation.y=angle;g.name='Decorative_snowman';winter.add(g);
sphere(g,snowMat,0,.53,0,.62,.53,.59);sphere(g,snowMat,0,1.15,0,.45,.43,.43);sphere(g,snowMat,0,1.75,0,.34,.34,.33);
for(const xx of [-.115,.115])sphere(g,charcoal,xx,1.83,.305,.037,.037,.026);
for(let i=0;i<5;i++){const a=(i-2)*.29;sphere(g,charcoal,Math.sin(a)*.15,1.63-Math.cos(a)*.045,.305,.016,.016,.015);}
for(const yy of [.95,1.13,1.3])sphere(g,charcoal,0,yy,.425,.034,.034,.023);
const nose=new THREE.Mesh(new THREE.ConeGeometry(.055,.25,14),carrot);nose.rotation.x=Math.PI/2;nose.position.set(0,1.75,.43);g.add(nose);
const cloth=new THREE.MeshStandardMaterial({color:scarfColor,roughness:.9});const scarf=new THREE.Mesh(new THREE.TorusGeometry(.30,.066,10,36),cloth);scarf.rotation.x=Math.PI/2;scarf.position.y=1.5;g.add(scarf);
const tail=new THREE.Mesh(new THREE.BoxGeometry(.13,.38,.04),cloth);tail.position.set(.2,1.3,.39);tail.rotation.z=.16;g.add(tail);
for(const side of [-1,1]){stick(g,[side*.35,1.25,0],[side*.85,1.55,0]);stick(g,[side*.7,1.46,0],[side*.83,1.72,.03],.014);stick(g,[side*.78,1.51,0],[side*.99,1.53,.02],.014);}
const brim=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.065,32),charcoal);brim.position.y=2.03;g.add(brim);const hat=new THREE.Mesh(new THREE.CylinderGeometry(.25,.27,.29,28),charcoal);hat.position.y=2.18;g.add(hat);
}
snowman(253,139,1.05,0xab5142,.3);snowman(278,174,.9,0x3b657c,-.4);snowman(292,118,.75,0x95743f,-.2);snowman(246,201,.85,0x536c50,.6);
// A separate decorative snow version of the toy. The original player is NOT replaced.
const winterNight=new THREE.Group();winterNight.visible=false;nightLighting.add(winterNight);
const snowToy=addBasketballToy(winter,texture,winterNight,{snowman:true,position:[265,.15,155]});snowToy.update(0);
// Snowfall is real depth-tested 3D particles, not a screen overlay.
const snowflake=texture((c,w,h)=>{c.clearRect(0,0,w,h);const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,h);},32,32);
// Campus-space snow: density and flake size are independently adjustable.
const maxSnowCount=22000,positions=new Float32Array(maxSnowCount*3),speeds=new Float32Array(maxSnowCount),phases=new Float32Array(maxSnowCount);
for(let i=0;i<maxSnowCount;i++){positions[i*3]=rand()*356-12;positions[i*3+1]=rand()*120;positions[i*3+2]=rand()*304-12;speeds[i]=1.3+rand()*1.7;phases[i]=rand()*6.28;}
const snowGeo=new THREE.BufferGeometry();snowGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
const snowMaterial=new THREE.PointsMaterial({color:0xffffff,size:.625,map:snowflake,transparent:true,opacity:.94,depthWrite:false,sizeAttenuation:true});
const snowPoints=new THREE.Points(snowGeo,snowMaterial);snowPoints.frustumCulled=false;snowPoints.name='Falling_snow';winter.add(snowPoints);
let activeSnowCount=11000;snowGeo.setDrawRange(0,activeSnowCount);
function setSnowDensity(percent){activeSnowCount=Math.round(maxSnowCount*THREE.MathUtils.clamp(Number(percent),0,100)/100);snowGeo.setDrawRange(0,activeSnowCount);}
function setSnowSize(percent){snowMaterial.size=1.25*THREE.MathUtils.clamp(Number(percent),10,100)/100;}
let season='summer',night=false,storm=false,lastTime=null;
function atmosphere(){const winterNow=season==='winter',p=palettes[season];scene.background.set(night?(winterNow?'#172a42':'#101e34'):p.sky);
ambient.color.set(night?'#8caee0':winterNow?'#e1edff':'#e7f0ff');ambient.groundColor.set(night?'#263a43':winterNow?'#c3cfdb':'#859677');ambient.intensity=night?(winterNow?.72:.53):winterNow?2.05:2.15;
sun.color.set(night?'#91b8ff':p.sun);sun.intensity=night?.32:winterNow?1.35:season==='autumn'?2.7:3.1;renderer.toneMappingExposure=night?1.12:winterNow?1.07:1.28;
if(storm&&season!=='winter'){scene.background.set(night?'#101925':'#64737d');ambient.color.set('#b9cbd8');ambient.intensity=night?.48:1.35;sun.intensity=night?.10:.45;sun.color.set('#c1d1df');renderer.toneMappingExposure=night?1.05:1.13;}
document.querySelector('#sun').disabled=night||storm;
document.querySelector('#status').textContent=`${p.label}季校园 · ${night?'夜间灯光':'白天'}${winterNow?' · 飘雪':storm?' · 阴天雷雨':''}`;
}
function setSeason(value){if(!palettes[value])return;season=value;const p=palettes[value],isWinter=value==='winter';
leafMats.forEach((m,i)=>m.color.set(p.leaves[i]));
for(const {mesh,originals} of leafMeshes){mesh.visible=!isWinter;for(let i=0;i<originals.length;i++){const m=originals[i].clone();const density=p.density===1?1:(i%5===0?.28:p.density);m.scale(new THREE.Vector3(density,density,density));mesh.setMatrixAt(i,m);}mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}
M.grass.color.set(p.grass);M.grass2.color.set(p.grass);M.hedge.color.set(isWinter?'#e8efef':value==='autumn'?'#a8a358':value==='spring'?'#adbe70':'#9eae52');
for(const key of ['paving','asphalt','ridge','water'])M[key].color.copy(original.colors[key]);
if(isWinter){M.paving.color.set('#e6eef1');M.asphalt.color.set('#cbd7de');M.ridge.color.set('#ecf3f5');M.water.color.set('#b9d1de');}
M.roof.map=isWinter?snowTexture:original.roofMap;M.roof.needsUpdate=true;sportMat.map=isWinter?winterPitchTexture:original.pitchMap;sportMat.needsUpdate=true;
winter.visible=isWinter;winterNight.visible=isWinter;autumn.visible=value==='autumn';
document.querySelectorAll('[data-season]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.season===value));document.querySelector('#season-note').textContent=p.desc;document.body.dataset.season=value;atmosphere();window.dispatchEvent(new CustomEvent('campus-season-change',{detail:value}));
}
function update(time){const dt=lastTime===null?0:Math.min(.05,time-lastTime);lastTime=time;if(season!=='winter')return;
for(let i=0;i<activeSnowCount;i++){const k=i*3;positions[k]+=dt*(.45+Math.sin(time*.7+phases[i])*.5);positions[k+1]-=dt*speeds[i];positions[k+2]+=dt*Math.cos(time*.4+phases[i])*.23;if(positions[k+1]<.25)positions[k+1]=105+Math.random()*15;if(positions[k]>344)positions[k]=-12;}
snowGeo.attributes.position.needsUpdate=true;
}
return {setStorm(value){storm=value;atmosphere();},setSeason,update,setSnowDensity,setSnowSize,setNight(value){night=value;atmosphere();},get season(){return season;}};
}
