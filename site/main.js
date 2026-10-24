import {addCampusLife} from './campus-life.js';
import {createShooting} from './shooting.js';
import {createWeather} from './weather.js';
import {createWalkMode} from './walk.js';
import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {addLandmarks} from './landmarks.js';
import {addBasketballToy} from './basketball-toy.js';
import {createSeasons} from './seasons.js';

// Coordinates follow reference photograph 6: x to the right, z toward its bottom.
// One scene unit is an estimated metre, not a surveyed measurement.
const scene=new THREE.Scene();scene.background=new THREE.Color('#dce5e7');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
document.querySelector('#viewport').appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.3,2200);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.maxPolarAngle=Math.PI*.485;controls.minDistance=1.1;controls.maxDistance=850;controls.target.set(0,0,0);
const campus=new THREE.Group();campus.name='Campus_photo_reconstruction';campus.position.set(-166,0,-140);scene.add(campus);
const ambient=new THREE.HemisphereLight(0xe7f0ff,0x859677,2.15);scene.add(ambient);
const sun=new THREE.DirectionalLight(0xffefd6,3.1);sun.position.set(-140,220,120);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);sun.shadow.camera.left=-240;sun.shadow.camera.right=240;sun.shadow.camera.top=240;sun.shadow.camera.bottom=-240;sun.shadow.camera.far=750;sun.shadow.normalBias=.12;sun.shadow.bias=-.0002;scene.add(sun);
const mat=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
function texture(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
let seed=71;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const brickTex=texture((c,w,h)=>{c.fillStyle='#a95a43';c.fillRect(0,0,w,h);for(let r=0;r<64;r++){for(let k=-1;k<16;k++){const x=k*34+(r%2)*17,y=r*8;c.fillStyle=`rgb(${167+rand()*22},${76+rand()*16},${51+rand()*14})`;c.fillRect(x+1,y+1,32,6);}}});
const roofTex=texture((c,w,h)=>{c.fillStyle='#315c83';c.fillRect(0,0,w,h);for(let i=0;i<h;i+=6){c.fillStyle='#426d90';c.fillRect(0,i,w,1);c.fillStyle='#244b70';c.fillRect(0,i+1,w,1);}for(let i=0;i<w;i+=12){c.fillStyle='#315675';c.fillRect(i,0,1,h);}});
const M={brick:mat('#b4664b'),cream:mat('#e5dfcb'),stone:mat('#aab2b0'),roof:mat('#456f96'),ridge:mat('#9fb8c4'),glass:mat('#314b57',.29),frame:mat('#b5b9ab'),asphalt:mat('#666e73'),paving:mat('#c8ceca'),white:mat('#ecece1'),yellow:mat('#dfc77f'),grass:mat('#668055'),grass2:mat('#5b7c42'),field1:mat('#538346'),field2:mat('#356b47'),track:mat('#a95952'),court:mat('#568f7a'),water:mat('#597c77',.19),dark:mat('#354749'),wood:mat('#6c6250'),leaf1:mat('#3d6848'),leaf2:mat('#567b46'),leaf3:mat('#77914e'),hedge:mat('#9eae52'),red:mat('#c93b36'),metal:mat('#8e9e9f',.35),skyglass:mat('#a3c5ce',.25)};
M.brick.map=brickTex;M.brick.color.set('#ffffff');M.roof.map=roofTex;M.roof.color.set('#ffffff');M.roof.side=THREE.DoubleSide;M.asphalt.side=THREE.DoubleSide;M.glass.metalness=.25;M.skyglass.metalness=.15;
M.glassLit=M.glass.clone();M.glassLit.emissive.set('#ffd491');M.glassLit.emissiveIntensity=0;
M.lamp=mat('#f8efd5');M.lamp.emissive.set('#ffdb9e');M.lamp.emissiveIntensity=0;
M.leaf1.color.set('#385e42');M.leaf2.color.set('#527645');M.leaf3.color.set('#738b4c');
const geo={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,48),sphere:new THREE.IcosahedronGeometry(1,1),foliage:new THREE.IcosahedronGeometry(1,2),branch:new THREE.CylinderGeometry(.6,1,1,7)};
const batches=new Map(),tmp=new THREE.Object3D();
function instance(g,m,x,y,z,sx,sy,sz,ry=0,rx=0,rz=0){const key=g.uuid+m.uuid;if(!batches.has(key))batches.set(key,{g,m,a:[]});tmp.position.set(x,y,z);tmp.scale.set(sx,sy,sz);tmp.rotation.set(rx,ry,rz);tmp.updateMatrix();batches.get(key).a.push(tmp.matrix.clone());}
function box(x,y,z,w,h,d,m,ry=0){instance(geo.box,m,x,y,z,w,h,d,ry);}
function cyl(x,y,z,r,h,m){instance(geo.cyl,m,x,y,z,r,h,r);}
function ball(x,y,z,r,m,s=1){instance(geo.sphere,m,x,y,z,r,r*s,r);}
function line(points,m=M.white,r=.045){const p=points.map(v=>new THREE.Vector3(...v));const curve=new THREE.CatmullRomCurve3(p,false,'centripetal');const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(2,points.length*3),r,5,false),m);campus.add(mesh);return mesh;}
function rawMesh(g,m,name){const mesh=new THREE.Mesh(g,m);mesh.castShadow=true;mesh.receiveShadow=true;mesh.name=name||'';campus.add(mesh);return mesh;}
function hip(x,z,w,d,y,rise=3.4){const inset=Math.min(w,d)*.43;const verts=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2]];let a,b;if(w>=d){a=[-w/2+inset,rise,0];b=[w/2-inset,rise,0];}else{a=[0,rise,-d/2+inset];b=[0,rise,d/2-inset];}verts.push(a,b);const ids=w>=d?[0,1,5,0,5,4,1,2,5,2,3,4,2,4,5,3,0,4]:[0,1,4,1,2,5,1,5,4,2,3,5,3,0,4,3,4,5];const pos=[],uv=[];for(const id of ids){const v=verts[id];pos.push(v[0]+x,v[1]+y,v[2]+z);uv.push((v[0]+w/2)/w,(v[2]+d/2)/d);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();rawMesh(g,M.roof,'Blue_hip_roof');box(x,y-.2,z,w,.45,d,M.cream);const ridge=(p,q)=>line([[x+p[0],y+p[1]+.045,z+p[2]],[x+q[0],y+q[1]+.045,z+q[2]]],M.ridge,.085);ridge(a,b);if(w>=d){ridge(verts[0],a);ridge(verts[3],a);ridge(verts[1],b);ridge(verts[2],b);}else{ridge(verts[0],a);ridge(verts[1],a);ridge(verts[2],b);ridge(verts[3],b);}}
function dormer(x,z,y,ry=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;const mesh=(w,h,d,yy,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.y=yy;g.add(o);};mesh(1.9,1.6,2,0,M.cream);const win=new THREE.Mesh(new THREE.BoxGeometry(1.1,1,.08),M.glass);win.position.set(0,0,1.04);g.add(win);const roof=new THREE.Mesh(new THREE.ConeGeometry(1.65,1.1,4),M.roof);roof.rotation.y=Math.PI/4;roof.position.y=1.32;g.add(roof);campus.add(g);}
function windows(x,z,w,d,h,floors,startFloor=0){const level=h/floors;for(const side of [-1,1]){const count=Math.max(2,Math.round(w/3.5));for(let i=0;i<count;i++){const xx=x-w/2+(i+.5)*w/count;for(let f=startFloor;f<floors;f++){const yy=(f+.51)*level;box(xx,yy,z+side*(d/2+.06),1.8,2,.14,M.frame);box(xx,yy+.03,z+side*(d/2+.15),1.52,1.76,.08,(i+f*3+(side+1))%5===0?M.glass:M.glassLit);box(xx,yy,z+side*(d/2+.21),.065,1.8,.05,M.dark);box(xx,yy-.05,z+side*(d/2+.22),1.54,.055,.05,M.dark);}if(i%2===0)box(xx+w/count*.49,h*.52,z+side*(d/2+.12),.3,h-5,.3,M.cream);}}
for(const side of [-1,1]){const count=Math.max(2,Math.round(d/3.8));for(let i=0;i<count;i++){const zz=z-d/2+(i+.5)*d/count;for(let f=startFloor;f<floors;f++){const yy=(f+.51)*level;box(x+side*(w/2+.07),yy,zz,.12,2,1.8,M.frame);box(x+side*(w/2+.15),yy+.03,zz,.08,1.76,1.52,(i*2+f+side+1)%4===0?M.glass:M.glassLit);box(x+side*(w/2+.2),yy,zz,.05,1.8,.065,M.dark);}}}}
const walkBuildings=[],walkStairs=[];
function building(name,x,z,w,d,h=20,floors=5,roof=true){const open=name==='Large span hall';walkBuildings.push({x,z,w,d,minFeet:open?2.9:0});if(open){box(x,(h+3.6)/2,z,w,h-3.6,d,M.brick);for(const [left,right] of [[x-w/2,190.5],[197.5,x+w/2]]){const width=right-left;if(width>0){box((left+right)/2,1.8,z,width,3.6,d,M.stone);walkBuildings.push({x:(left+right)/2,z,w:width,d});}}for(const side of [-1,1])for(let zz=z-d/2+1;zz<=z+d/2;zz+=8){const columnX=side===1?198.15:x-w/2+.6;box(columnX,1.8,zz,.85,3.6,.85,M.stone);walkBuildings.push({x:columnX,z:zz,w:.85,d:.85});}}else{box(x,h/2,z,w,h,d,M.brick);box(x,1.8,z,w+.2,3.6,d+.2,M.stone);}box(x,h-1.75,z,w+.25,3.5,d+.25,M.cream);for(const yy of [3.6,h-3.5,h-.1])box(x,yy,z,w+.65,.24,d+.65,M.cream);windows(x,z,w,d,h,floors,open?1:0);if(roof)hip(x,z,w+1.7,d+1.7,h+.35);}
function steps(x,z,w,length,base,height,dir=1,n=20){walkStairs.push({x,z,w,length,base,height,dir});for(let i=0;i<n;i++){const hh=height*(i+1)/n;box(x,base+hh/2,z+dir*(length/2-(i+.5)*length/n),w,hh,length/n+.025,M.stone);}for(const s of [-1,1]){line([[x+s*w/2,base+1,z+dir*length/2],[x+s*w/2,base+height+1,z-dir*length/2]],M.metal,.055);}}
function branch(a,b,r){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);const key=geo.branch.uuid+M.wood.uuid;if(!batches.has(key))batches.set(key,{g:geo.branch,m:M.wood,a:[]});tmp.position.copy(from).add(to).multiplyScalar(.5);tmp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());tmp.scale.set(r,delta.length(),r);tmp.updateMatrix();batches.get(key).a.push(tmp.matrix.clone());}
const treeLocations=[];
function tree(x,z,s=1){
// Keep full crowns outside the raised hall corridors and connecting terrace.
if((x>=139&&x<=151&&z>=145&&z<=222)||(x>=149&&x<=158&&z>=68&&z<=145))return;
treeLocations.push({x,z,s});
const height=(5.4+rand()*1.4)*s,spread=(1.85+rand()*.5)*s,phase=rand()*Math.PI*2;
branch([x,0,z],[x+.12*s,height*.69,z-.1*s],.21*s);
for(let i=0;i<7;i++){
const angle=phase+i*2.399,reach=spread*(.45+rand()*.45),yy=height*(.58+rand()*.19);
const xx=x+Math.cos(angle)*reach,zz=z+Math.sin(angle)*reach;
branch([x,height*.37,z],[xx,yy,zz],.075*s);
for(const sign of [-1,1])branch([xx,yy-.2*s,zz],[xx+Math.cos(angle+sign*.7)*.65*s,yy+.75*s,zz+Math.sin(angle+sign*.7)*.65*s],.027*s);
const radius=(.85+rand()*.38)*s,material=[M.leaf1,M.leaf2,M.leaf3][i%3];
instance(geo.foliage,material,xx,yy+.45*s,zz,radius*1.15,radius*(1+rand()*.45),radius,angle);
// Smaller lobes break the silhouette, retaining dense broadleaf crowns.
instance(geo.foliage,material,xx+Math.cos(angle)*.55*s,yy+.25*s,zz+Math.sin(angle)*.55*s,radius*.65,radius*.8,radius*.7,angle+.5);
}
instance(geo.foliage,M.leaf2,x,height*.89,z,spread*.6,spread*.65,spread*.57,phase);
}
function shrub(x,z,r=.9){ball(x,.7*r,z,r,M.hedge,.8);}
function lawn(x,z,w,d){box(x,.11,z,w,.22,d,M.grass);}
function planter(x,z,w,d){box(x,.2,z,w,.4,d,M.stone);box(x,.43,z,w-.35,.08,d-.35,M.grass);}
function road(x,z,w,d,alongZ=true){box(x,.035,z,w,.07,d,M.asphalt);if(alongZ){box(x-w/2+.3,.09,z,.13,.02,d,M.white);box(x+w/2-.3,.09,z,.13,.02,d,M.white);for(let a=z-d/2+2;a<z+d/2;a+=5)box(x,.09,a,.13,.02,2,M.yellow);}else{box(x,.09,z-d/2+.3,w,.02,.13,M.white);box(x,.09,z+d/2-.3,w,.02,.13,M.white);for(let a=x-w/2+2;a<x+w/2;a+=5)box(a,.09,z,2,.02,.13,M.yellow);}}

// Site slab, perimeter streets and the paved school grounds.
box(166,-1.6,140,340,2.8,288,M.stone);box(166,-.15,140,332,.3,280,M.paving);
box(166,-3.3,140,1600,.4,1600,mat('#dce5e7'));
road(166,286,360,10,false);road(-7,140,10,280);road(338,140,10,280);road(166,-7,350,9,false);
road(7,138,7,261);road(99,191,7,138);road(139,191,7,138);road(75,73,6,50);road(81.5,98,13,6,false);road(147,75,6,47);road(194,143,7,254);road(101,49,188,7,false);road(103,260,190,7,false);road(103,5,188,6,false);
for(let i=0;i<9;i++){box(115+i*.85,.1,260,.42,.04,5,M.white);box(8,.1,164+i*.85,6,.04,.42,M.white);}
// Paired upper bars.
building('Upper west',63,24,78,28,21.6,6);building('Upper east',153,24,77,28,21.6,6);
for(const x of [63,153]){box(x,2.8,39.4,5.4,5.6,2.8,M.cream);box(x,2.2,41,3,4.4,.2,M.glass);steps(x,43.2,7,3,0,1,1,6);}
// Two open courtyard blocks. Junctions overlap exactly to retain U silhouettes.
for(const [top,bottom] of [[77,139],[187,247]]){
building('Courtyard west wing',17,(top+bottom)/2,18,bottom-top+18,20.5,5);
// The upper block stops before the x=75 road; retain the original west end.
building('Courtyard upper wing',top===77?39.5:49,top,top===77?62:81,18,20.5,5);
building('Courtyard lower wing',49,bottom,81,18,20.5,5);
for(const zz of [top,bottom])for(const xx of [30,48,66])for(const offset of [-2.1,2.1])dormer(xx+offset,zz+3.3,22.1);
planter(48,(top+bottom)/2,22,19);for(let j=0;j<7;j++)tree(41+rand()*14,(top+bottom)/2-6+rand()*12,.6+rand()*.25);
for(const xx of [30,67]){box(xx,.16,(top+bottom)/2,1,.08,40,M.stone);}
for(const zz of [top+14,bottom-14]){planter(80,zz,4,7);shrub(80,zz,1.3);}
}
// Courtyard connecting bridge: a true arched opening rather than a solid block.
function archWall(x,z,w,h,depth,opening=4){const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();const hole=new THREE.Path();hole.moveTo(-opening/2,0);hole.lineTo(-opening/2,2.8);hole.absarc(0,2.8,opening/2,Math.PI,0,true);hole.lineTo(opening/2,0);hole.closePath();shape.holes.push(hole);const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24});const m=rawMesh(g,M.cream,'Walkable_arch');m.rotation.y=Math.PI/2;m.position.set(x-depth/2,0,z);}
archWall(81,164,12,8,5,5.3);box(81,10.1,164,6,4.2,13,M.brick);box(84.1,10.2,164,.1,2.8,8,M.glass);box(77.9,10.2,164,.1,2.8,8,M.glass);hip(81,164,8,15,12.4,2);
for(const zz of [152,176]){box(81,6.5,zz,5,1.1,12,M.cream);box(81,8,zz,5,2,12,M.brick);box(83.55,8,zz,.1,1.3,10,M.glass);hip(81,zz,6,12,9.3,1.2);box(81,3,zz+(zz<164?-4.5:4.5),1.1,6,1.1,M.stone);}
// Round central hall with a ring of vertical piers, recessed glazing and a roof terrace.
// Align with the plaza axis while keeping the east facade clear of the x=147 road.
const cx=117,cz=98,rad=26;
cyl(cx,1.65,cz,rad,3.3,M.stone);cyl(cx,9.8,cz,rad-.8,13,M.glass);cyl(cx,3.5,cz,rad+.2,.6,M.cream);cyl(cx,16.8,cz,rad+.5,.6,M.brick);
// Use a smooth cylinder on this landmark, instead of faceting its silhouette.
const round=new THREE.Mesh(new THREE.CylinderGeometry(rad-.9,rad-.9,13,96),M.glass);round.position.set(cx,9.8,cz);campus.add(round);
for(let i=0;i<44;i++){const a=i/44*Math.PI*2,x=cx+Math.cos(a)*(rad-.3),z=cz+Math.sin(a)*(rad-.3);box(x,10,z,1.2,13.3,1.15,M.brick,-a);box(cx+Math.cos(a)*(rad-.8),10,z,.16,12,.16,M.frame);box(cx+Math.cos(a)*(rad-.2),1.8,cz+Math.sin(a)*(rad-.2),.6,3.6,.6,M.stone);}
for(const yy of [7.1,12.6]){const ring=new THREE.Mesh(new THREE.TorusGeometry(rad-.78,.075,5,96),M.frame);ring.rotation.x=Math.PI/2;ring.position.set(cx,yy,cz);campus.add(ring);}
const terrace=new THREE.Mesh(new THREE.CylinderGeometry(rad+.4,rad+.4,.45,96),M.stone);terrace.position.set(cx,17.2,cz);campus.add(terrace);
const rim=new THREE.Mesh(new THREE.TorusGeometry(rad+.3,.35,6,96),M.cream);rim.rotation.x=Math.PI/2;rim.position.set(cx,17.6,cz);campus.add(rim);
box(cx,18.6,cz,35,2.6,34,M.cream);box(cx,20,cz,33,.3,32,M.roof);box(cx,20.2,cz,.25,.25,32,M.ridge);
for(const side of [-1,1])for(let i=0;i<5;i++){box(cx+side*22,18,cz-8+i*3,2,1.6,2,M.white);cyl(cx+side*22,18.85,cz-8+i*3,.6,.12,M.metal);}
box(cx,2,cz+rad+3,22,4,9,M.stone);steps(cx,cz+rad+13,16,15,0,4,1,26);
for(const side of [-1,1]){planter(cx+side*10,cz+rad+12,3.1,12);for(let i=0;i<6;i++)shrub(cx+side*10,cz+rad+7+i*1.7,.9);tree(cx+side*15,cz+rad+3,1.1);}
for(let i=-3;i<=3;i++){const pane=new THREE.Mesh(new THREE.BoxGeometry(3.1,.14,3.2),M.skyglass);pane.position.set(cx+i*3.15,6.1+Math.abs(i%2)*.3,cz+rad-1);pane.rotation.z=(i%2?1:-1)*.15;campus.add(pane);}
// Curve the two flanking roads around the circular hall.
function arcRoad(start,end){const shape=new THREE.Shape();shape.absarc(cx,cz,rad+5,start,end,false);shape.absarc(cx,cz,rad+1,end,start,true);shape.closePath();const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape,64),M.asphalt);mesh.rotation.x=Math.PI/2;mesh.position.y=.06;campus.add(mesh);}
arcRoad(0,Math.PI*2);
// Two large halls and their roof lanterns.
function hall(x,z,w,d){building('Large span hall',x,z,w,d,17,3,false);box(x,17.45,z,w+2,.8,d+2,M.cream);box(x,17.95,z,w+1.5,.3,d+1.5,M.roof);for(let i=0;i<9;i++){const zz=z-d*.28+i*d*.065;box(x,18.6,zz,w*.58,1.1,1.65,M.skyglass);box(x,19.2,zz,w*.58,.12,1.72,M.white);for(let j=-2;j<=2;j++)box(x+j*w*.105,18.65,zz,.1,1.12,1.8,M.frame);}
for(const side of [-1,1])for(let zz=z-d/2+4;zz<z+d/2-2;zz+=4.6){box(x+side*(w/2+.2),10,zz,.35,11,2.1,M.cream);box(x+side*(w/2+.41),10,zz,.08,10.3,1.45,M.glassLit);box(x+side*(w/2+.48),10.5,zz,.09,.13,1.5,M.frame);}box(x-w/2-2.1,3.4,z,4.2,.5,d,M.stone);for(let a=z-d/2+1;a<z+d/2;a+=4)box(x-w/2-3.9,1.5,a,.6,3,.6,M.stone);if(z>150)steps(x-w/2-2,z+d/2+4,4,8,0,3.5,1,14);
}
hall(177,102,41,65);hall(172,183,51,69);
// The sheltered route follows the existing 7 m road at x=194.
// The former central opening at x=177 is now filled by the solid ground floor.
const passageLights=new THREE.Group();campus.add(passageLights);
const passageLamp=new THREE.MeshStandardMaterial({color:0xf6e4bc,emissive:0xffd99b,emissiveIntensity:0});
for(let z=75;z<=212;z+=13){box(194,3.45,z,1.2,.08,.30,passageLamp);const light=new THREE.PointLight(0xffdfad,14,14,2);light.position.set(194,2.9,z);passageLights.add(light);}
passageLights.visible=false;

// Ground access to the canteen corridor; top joins the existing 3.65 m deck.
steps(154.4,65.5,4.2,8,0,3.65,-1,22);
// Photo correction: this is an OPEN stair / landing bay, not a third building.
// The roof joins the halls only along the field-side strip, leaving an inner notch.
box(190.2,17.45,141.5,16.5,.8,16,M.cream);
box(190.2,17.95,141.5,16.4,.3,16.2,M.roof);
line([[182,18.12,133.4],[182,18.12,149.6]],M.ridge,.07);
// A single level terrace reaches BOTH hall corridors without a step or gap.
// Hall corridor edges are x=152.3 (north) and x=142.3 (south), top y=3.65.
box(164.5,3.4,141.5,44.4,.5,14,M.stone);
for(const x of [143,153.5,165,185])for(const z of [136,147])box(x,1.55,z,.65,3.1,.65,M.stone);
// Stair runs toward the field (+x), parallel to the north hall's end wall.
// It does NOT cross from one hall to the other across the bay (+/-z).
for(let i=0;i<30;i++){
const hh=4.55*(i+1)/30;
box(160+(i+.5)*22/30,3.65+hh/2,137,22/30+.02,hh,4.5,M.stone);
}
box(183.5,7.95,137,3,.5,4.5,M.stone);
for(const z of [134.75,139.25]){
line([[160,4.65,z],[182,9.2,z],[185,9.2,z]],M.metal,.055);
for(let i=0;i<=15;i++){const x=160+i*22/15,y=3.65+4.55*i/15;box(x,y+.5,z,.045,1,.045,M.metal);}
}
// Rail only the exposed outer edges; no railing blocks the corridor connections.
line([[142.3,4.7,134.5],[142.3,4.7,148.5]],M.metal,.055);
line([[142.3,4.05,134.5],[142.3,4.05,148.5]],M.metal,.025);
for(let z=135;z<149;z+=1.25)box(142.3,4.15,z,.045,1.05,.045,M.metal);
line([[142.3,4.7,134.5],[152.3,4.7,134.5]],M.metal,.055);
for(let x=143;x<152;x+=1.25)box(x,4.15,134.5,.045,1.05,.045,M.metal);
// Spectator terraces: successive heights rise away from the running track.
for(const [z,d] of [[102,65],[183,69]]){for(let i=0;i<9;i++)box(204-i*.7,.18+i*.23,z,.76,.36+i*.46,d,M.stone);for(let zz=z-d/2+3;zz<z+d/2;zz+=12){box(200.9,2.5,zz,6.4,.05,.7,M.white);}}
// Continuous top-level gallery along BOTH stands and across the middle bay.
box(198.8,3.86,143.5,2.4,.36,148,M.stone);
for(const x of [197.7,199.9]){
 line([[x,5.12,69.5],[x,5.12,217.5]],M.metal,.045);
 line([[x,4.56,69.5],[x,4.56,217.5]],M.metal,.025);
 for(let z=69.5;z<=217.5;z+=1.25)box(x,4.58,z,.05,1.08,.05,M.metal);
 walkBuildings.push({x,z:143.5,w:.05,d:148,minFeet:2.5});
}
// Only the two ends are open: purpose-built stairs reach the gallery directly.
steps(198.8,64.5,2.4,10,0,4.04,-1,24);
steps(198.8,222.5,2.4,10,0,4.04,1,24);
for(const z of [135.3,147.7]){box(197.95,1.84,z,.45,3.68,.45,M.stone);walkBuildings.push({x:197.95,z,w:.45,d:.45});}
building('Entrance building',170,244,55,24,20,5);box(170,21,256.4,10,3,.5,M.cream);hip(170,253.5,12,8,22.6,2.5);
// Long central garden axis.
box(117,.15,205,28,.3,100,M.paving);for(const x of [104,130])box(x,.32,205,.35,.08,96,M.stone);
for(const [x,z,w,d] of [[109,238,5,13],[125,238,5,13],[109,222,5,7],[125,222,5,7],[109,199,5,7],[125,199,5,7]]){planter(x,z,w,d);shrub(x,z,1.4);}
cyl(117,.45,214,6.2,.55,M.dark);cyl(117,.76,214,5.75,.07,M.water);
planter(117,189,12,8);const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(2.7,0),mat('#b6ac8e'));rock.scale.set(1.6,.8,.8);rock.position.set(117,1.9,189);rock.rotation.set(.2,.3,.15);campus.add(rock);tree(121,188,.95);
box(117,.25,181,7,.5,5,M.brick);cyl(117,7.7,181,.1,15,M.metal);box(118.5,14.2,181,2.8,1.75,.05,M.red);
for(let i=0;i<4;i++)box(117,.15+i*.12,226+i*.45,24,.3+i*.24,.45,M.stone);
// Athletics area: shape and linework are painted at high resolution onto a real surface.
const sportTex=texture((c,w,h)=>{const sx=w/122,sy=h/272;c.scale(sx,sy);c.fillStyle='#aa5753';c.fillRect(0,0,122,272);const rr=(x,z,ww,hh,r)=>{c.beginPath();c.roundRect(x,z,ww,hh,r);};
for(let i=0;i<8;i++){c.strokeStyle='#eac5b8';c.lineWidth=.16;rr(4+i*1.2,46+i*1.2,114-i*2.4,217-i*2.4,54-i*1.2);c.stroke();}
c.save();rr(14,88,88,135,1);c.clip();for(let i=0;i<28;i++){c.fillStyle=i%2?'#3d784a':'#639246';c.fillRect(14,88+i*5,88,5);}c.restore();c.strokeStyle='#e3e7ca';c.lineWidth=.22;c.strokeRect(15,89,86,133);c.beginPath();c.moveTo(15,155.5);c.lineTo(101,155.5);c.stroke();c.beginPath();c.arc(58,155.5,9,0,Math.PI*2);c.stroke();
for(const z of [89,222]){const dir=z<150?1:-1;c.strokeRect(39,z,38,dir*15);c.strokeRect(48,z,20,dir*5);c.beginPath();c.arc(58,z+dir*11,.3,0,7);c.fillStyle='#fff';c.fill();}
// Four basketball courts at the upper end.
for(let i=0;i<4;i++){const x=7+i*22;c.fillStyle='#568f7e';c.fillRect(x,4,20,37);c.strokeStyle='#e4ddd0';c.lineWidth=.16;c.strokeRect(x+.8,5,18.4,35);c.beginPath();c.moveTo(x+.8,22.5);c.lineTo(x+19.2,22.5);c.stroke();c.beginPath();c.arc(x+10,22.5,3,0,7);c.stroke();for(const zz of [5,34]){c.fillStyle='#a35a56';c.fillRect(x+6,zz,8,6);c.strokeRect(x+6,zz,8,6);c.beginPath();c.arc(x+10,zz+(zz===5?5:1),6,zz===5?0:Math.PI,zz===5?Math.PI:Math.PI*2);c.stroke();}}
for(const zz of [65,236])for(let i=0;i<3;i++){c.strokeStyle='#dbb0a1';c.lineWidth=.12;c.strokeRect(40+i*10,zz,8,15);c.beginPath();c.moveTo(40+i*10,zz+7.5);c.lineTo(48+i*10,zz+7.5);c.stroke();}
},1536,3072);
const sportMat=mat('#ffffff');sportMat.map=sportTex;const pitch=new THREE.Mesh(new THREE.PlaneGeometry(122,272),sportMat);pitch.rotation.x=-Math.PI/2;pitch.position.set(267,.13,140);pitch.receiveShadow=true;campus.add(pitch);
// Actual goal frames and nets.
function goal(x,z,dir){for(const dx of [-3.5,3.5]){box(x+dx,1.25,z,.12,2.5,.12,M.white);box(x+dx,1.25,z+dir*1.4,.08,2.5,.08,M.white);}box(x,2.5,z,7.1,.12,.12,M.white);box(x,2.5,z+dir*1.4,7.1,.08,.08,M.white);for(let k=0;k<=14;k++)box(x-3.5+k*.5,1.25,z+dir*1.4,.018,2.5,.018,M.white);for(let k=1;k<=5;k++)box(x,k*.45,z+dir*1.4,7,.018,.018,M.white);for(const dx of [-3.5,3.5])box(x+dx,2.5,z+dir*.7,.08,.08,1.4,M.white);}
goal(264,93,-1);goal(264,226,1);
for(let i=0;i<4;i++)for(const zz of [10,42]){const xx=223+i*22;box(xx,1.7,zz,.12,3.4,.12,M.metal);box(xx,3.2,zz+(zz<20?1:-1),1.6,1,.12,M.white);const hoop=new THREE.Mesh(new THREE.TorusGeometry(.36,.035,5,16),M.red);hoop.rotation.x=Math.PI/2;hoop.position.set(xx,3.0,zz+(zz<20?1.4:-1.4));campus.add(hoop);}
for(let xx=209;xx<=301;xx+=4)box(xx,2.5,46,.09,5,.09,M.metal);for(const yy of [1,2,3,4,5])box(255,yy,46,92,.025,.025,M.metal);
// Covered benches, perimeter walls, and the two entrance pavilions.
function shelter(x,z,w,d){box(x,3.1,z,w,.16,d,M.skyglass);for(let xx=x-w/2;xx<=x+w/2+.1;xx+=3){box(xx,1.55,z-d/2,.12,3.1,.12,M.metal);box(xx,1.55,z+d/2,.12,3.1,.12,M.metal);box(xx,3.2,z,.08,.12,d,M.white);}box(x,.6,z,w,.3,d*.5,M.stone);}
shelter(202,24,7,30);shelter(206,268,34,9);
for(let x=2;x<332;x+=6){for(const z of [1,279]){if(z===279&&x>93&&x<142)continue;box(x,1.35,z,.7,2.7,.7,M.brick);box(x,2.8,z,.9,.2,.9,M.cream);box(x+2.8,1.1,z,5,.09,.08,M.dark);box(x+2.8,1.85,z,5,.09,.08,M.dark);for(let a=1;a<6;a++)box(x+a,1.25,z,.045,1.9,.045,M.dark);}}
for(let z=4;z<279;z+=6)for(const x of [1,331]){if(x===1&&z>=148&&z<=178)continue;box(x,1.3,z,.7,2.6,.7,M.brick);box(x,2.7,z,.9,.2,.9,M.cream);box(x,1.2,z+2.5,.1,2.1,4.8,M.cream);}
for(const x of [99,137]){box(x,2.4,273,4.6,4.8,4,M.brick);box(x,4.9,273,5.5,.45,4.8,M.cream);box(x,2.1,275.05,2,3.8,.1,M.glass);box(x,2.1,275.15,1.5,3.2,.05,M.dark);}box(118,.13,274,31,.26,12,M.paving);
// Gardens follow the unbuilt pockets in the reference, leaving all courts open.
for(const [x,z,w,d] of [[45,59,57,11],[109,61,52,12],[169,60,42,11],[47,156,53,7],[48,176,55,6],[92,205,3,80],[147,235,5,22]]){lawn(x,z,w,d);for(let xx=x-w/2+3;xx<x+w/2;xx+=7){if(z===59&&xx>44&&xx<64)continue;tree(xx,z,.7+rand()*.25);}}
for(let z=14;z<268;z+=9){if(z<147||z>181)tree(3,z,.9);tree(327,z,.9);if(z>150&&z<249){tree(144,z,.65);tree(92,z,.7);}}
for(let x=15;x<324;x+=9){tree(x,276,.85);tree(x,2,.7);}
for(const [x,z] of [[93,83],[93,120],[150,81],[149,125],[132,154],[103,154],[87,263],[148,262],[189,229]])tree(x,z,1.05);
const nightLighting=new THREE.Group();nightLighting.name='Night_lighting';nightLighting.visible=false;campus.add(nightLighting);
const glowMap=texture(c=>{const g=c.createRadialGradient(256,256,0,256,256,256);g.addColorStop(0,'rgba(255,222,166,0.65)');g.addColorStop(.3,'rgba(255,211,137,0.25)');g.addColorStop(1,'rgba(255,207,136,0)');c.fillStyle=g;c.fillRect(0,0,512,512);});
const poolMaterial=new THREE.MeshBasicMaterial({map:glowMap,transparent:true,opacity:.63,depthWrite:false,blending:THREE.AdditiveBlending});
const haloMaterial=new THREE.SpriteMaterial({map:glowMap,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending});
function lamp(x,z,height=4.6){
cyl(x,.13,z,.23,.26,M.stone);cyl(x,height/2,z,.065,height,M.dark);
box(x,height,z,.74,.14,.74,M.dark);box(x,height-.13,z,.57,.15,.57,M.lamp);
const halo=new THREE.Sprite(haloMaterial);halo.position.set(x,height-.1,z);halo.scale.set(1.8,1.8,1);nightLighting.add(halo);
const pool=new THREE.Mesh(new THREE.PlaneGeometry(13,13),poolMaterial);pool.rotation.x=-Math.PI/2;pool.position.set(x,.2,z);nightLighting.add(pool);
}
for(let z=159;z<251;z+=12)for(const x of [101.5,134])lamp(x,z);
for(let z=62;z<255;z+=23)lamp(10.5,z);
for(let x=24;x<190;x+=23){lamp(x,45);lamp(x,263);}
for(const [x,z] of [[81,70],[77,115],[149,72],[147,124],[153,155],[143,180],[143,210],[211,60],[211,116],[211,194],[318,90],[318,170],[318,248],[93,273],[143,273]])lamp(x,z,5.3);
// A small number of real lights illuminate nearby walls, branches and steps.
for(const [x,z,power] of [[117,201,210],[117,241,210],[117,130,230],[149,144,240],[48,110,170],[48,217,170],[118,270,260],[153,52,190]]){
const light=new THREE.PointLight(0xffd49b,power,28,2);light.position.set(x,5,z);nightLighting.add(light);
}
for(let z=150;z<250;z+=13){box(106,.6,z,1.4,.16,.6,M.wood);box(106,.3,z,.15,.6,.6,M.dark);}
// A few figures provide a consistent scale without crowding the architecture.
for(let i=0;i<43;i++){let x,z;if(i<22){x=106+rand()*23;z=151+rand()*92;}else{x=139+rand()*4;z=73+rand()*165;}cyl(x,.67,z,.2,.9,M.white);ball(x,1.29,z,.19,M.wood);box(x-.1,.2,z,.12,.4,.16,M.dark);box(x+.1,.2,z,.12,.4,.16,M.dark);}
addLandmarks({campus,renderer,box,cyl,line,M,texture,nightLighting,lamp});
const basketballToy=addBasketballToy(campus,texture,nightLighting);
// Combine repeated details by material to keep thousands of windows and trees interactive.
for(const {g,m,a} of batches.values()){const mesh=new THREE.InstancedMesh(g,m,a.length);a.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.name='Repeated_'+(Object.entries(M).find(([,v])=>v===m)?.[0]||'detail');mesh.castShadow=m!==M.asphalt&&m!==M.paving;mesh.receiveShadow=true;mesh.computeBoundingSphere();campus.add(mesh);}

const seasons=createSeasons({campus,scene,M,sportMat,texture,treeLocations,ambient,sun,renderer,nightLighting,camera});
document.querySelectorAll('[data-season]').forEach(button=>button.onclick=()=>seasons.setSeason(button.dataset.season));
const labels=[['双人举臂雕塑',54,11,59],['教学楼',47,25,110],['教学楼',47,25,216],['黉学礼堂',117,23,98],['食堂',177,23,102],['室内体育馆',172,23,183],['田径运动场',266,2,156],['中央景观广场',117,2,211],['学生宿舍',151,27,24]];
const labelLayer=document.querySelector('#labels-layer');for(const [name,x,y,z] of labels){const el=document.createElement('div');el.className='pin';el.textContent=name;labelLayer.appendChild(el);}

let transition=null;const views={lifeFootball:{p:[100,5,54],t:[89,.7,42]},standBridge:{p:[49,9,3],t:[32.8,4,1.5]},life:{p:[132,12,65],t:[110,0,43]},lifeCards:{p:[121,3.2,68],t:[118,.6,64]},lifePicnic:{p:[121,3.3,9],t:[118,.6,5]},lifeSteps:{p:[40,5,-20],t:[35,2.6,-23]},lifeBadminton:{p:[132,4,-17],t:[125,1,-24]},snowmen:{p:[106,5,25],t:[99,1.3,15]},player:{p:[57,2.15,-99.7],t:[57,1.08,-104]},playerBack:{p:[55.1,2.1,-108.3],t:[57,1.08,-104]},gate:{p:[-196,8,24],t:[-157,4,24]},sculpture:{p:[-101,10,-74],t:[-112,5,-81]},connection:{p:[-62,31,1],t:[12,8,1]},overview:{p:[-270,270,365],t:[-5,0,0]},plan:{p:[0,470,.01],t:[0,0,0]},sports:{p:[345,250,310],t:[0,0,0]},axis:{p:[-49,32,116],t:[-54,6,-37]},court:{p:[-134,43,36],t:[-83,8,23]}};
let walking;
function go(name,instant=false){if(walking?.active)walking.exit();if(name==='snowmen')seasons.setSeason('winter');camera.filmOffset=['player','playerBack'].includes(name)?-4:0;camera.updateProjectionMatrix();const v=views[name];controls.autoRotate=false;document.querySelector('#rotate').setAttribute('aria-pressed','false');document.querySelectorAll('[data-view]').forEach(e=>e.classList.toggle('active',e.dataset.view===name));const p=new THREE.Vector3(...v.p),t=new THREE.Vector3(...v.t);if(['overview','plan','sports'].includes(name)){p.sub(t).multiplyScalar(Math.max(1,1.55/camera.aspect)).add(t);}if(instant){camera.position.copy(p);controls.target.copy(t);}else transition={from:camera.position.clone(),targetFrom:controls.target.clone(),p,t,start:performance.now()};}
const initialView=new URLSearchParams(location.search).get('view');go(Object.hasOwn(views,initialView)?initialView:'overview',true);document.querySelectorAll('[data-view]').forEach(e=>e.onclick=()=>go(e.dataset.view));controls.addEventListener('start',()=>transition=null);
document.querySelector('#practice').onclick=e=>{const running=basketballToy.toggle();e.currentTarget.textContent=running?'暂停练球':'继续练球';e.currentTarget.setAttribute('aria-pressed',!running);};
document.querySelector('#labels').onclick=e=>{const on=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',on);labelLayer.style.display=on?'block':'none';};
document.querySelector('#rotate').onclick=e=>{controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=.55;e.currentTarget.setAttribute('aria-pressed',controls.autoRotate);};
for(const [id,setter] of [['snow-density',seasons.setSnowDensity],['snow-size',seasons.setSnowSize]]){
const input=document.getElementById(id),output=document.getElementById(id+'-value');
input.oninput=()=>{setter(input.value);output.textContent=input.value+'%';};input.oninput();
}
document.querySelector('#sun').oninput=e=>{const a=Number(e.target.value)*Math.PI/180;sun.position.set(-170,80+Math.sin(a)*210,Math.cos(a)*220);};
let isNight=false;
document.querySelector('#time-toggle').onclick=()=>{
isNight=!isNight;nightLighting.visible=isNight;
M.glassLit.emissiveIntensity=isNight?1.65:0;M.glass.emissive.set('#d3b47c');M.glass.emissiveIntensity=isNight?.06:0;
M.lamp.emissiveIntensity=isNight?3.6:0;M.skyglass.emissive.set('#eccfa4');M.skyglass.emissiveIntensity=isNight?.12:0;
document.body.classList.toggle('night',isNight);
const button=document.querySelector('#time-toggle');button.setAttribute('aria-pressed',isNight);button.innerHTML=isNight?'☾ 夜间 <span>切换白天</span>':'☀ 白天 <span>切换夜景</span>';
document.querySelector('#sun').disabled=isNight;seasons.setNight(isNight);
};
function toast(t){const el=document.querySelector('#toast');el.textContent=t;el.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.style.display='none',4500);}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),30000);}
document.querySelector('#capture').onclick=()=>{renderer.render(scene,camera);renderer.domElement.toBlob(b=>{if(b)download(b,'campus-view.png');});};
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
walking=createWalkMode({camera,controls,campus,canvas:renderer.domElement,buildings:walkBuildings,stairs:walkStairs,onEnter:()=>{transition=null;}});
const weather=createWeather({scene,campus,renderer,M,sportMat,seasons});
const shooting=createShooting({campus,camera,controls,toy:basketballToy,walking,onStart:()=>{transition=null;}});
const campusLife=addCampusLife(campus,basketballToy.root);
const projected=new THREE.Vector3();function animate(now){requestAnimationFrame(animate);basketballToy.update(now*.001);seasons.update(now*.001);weather.update(now*.001);passageLights.visible=isNight||weather.enabled;passageLamp.emissiveIntensity=passageLights.visible?2:0;shooting.update(now*.001);campusLife.update(now*.001,{season:seasons.season,storm:weather.enabled,night:isNight});if(transition){const t=Math.min(1,(now-transition.start)/1100),ease=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.p,ease);controls.target.lerpVectors(transition.targetFrom,transition.t,ease);if(t===1)transition=null;}if(walking.active)walking.update(now);else if(!shooting.active)controls.update();if(labelLayer.style.display==='block')labels.forEach(([,x,y,z],i)=>{projected.set(x-166,y,z-140).project(camera);const el=labelLayer.children[i];el.style.left=(projected.x*.5+.5)*innerWidth+'px';el.style.top=(-projected.y*.5+.5)*innerHeight+'px';el.style.visibility=projected.z<1?'visible':'hidden';});renderer.render(scene,camera);}
requestAnimationFrame(animate);document.querySelector('#loading').remove();seasons.setSeason(new URLSearchParams(location.search).get('season')||'spring');
window.campusDebug={scene,camera,renderer,controls,campus,go,estimatedScale:true,stats:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,objects:campus.children.length})};
