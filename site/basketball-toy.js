import * as THREE from 'three';

// A fully modelled vinyl-style character; front is +z, rear is -z.
// Standing stature is fitted to exactly 1.90 estimated metres, independent of camera zoom.
export function addBasketballToy(campus,texture,nightLighting,options={}){
const snowman=options.snowman===true;const origin=options.position||[223,.145,36];
const root=new THREE.Group();root.name='Basketball_practice_toy_1.90m';root.position.set(...origin);campus.add(root);
const body=new THREE.Group();root.add(body);
const mat=(color,roughness=.48,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const yellow=mat('#f6cf2d'),black=mat('#15191d'),edge=mat('#111316'),white=mat('#f7f7ee',.3),red=mat('#d53a37'),orange=mat('#db8b24'),silver=mat('#bfc7d3',.3,.25),pants=mat('#9ca6b3'),strap=mat('#e2e7e7'),shoe=mat('#13171b',.35),sole=mat('#30363d'),metal=mat('#abb5bb',.24,.6);
const snow=new THREE.MeshStandardMaterial({color:0xf0f5f4,roughness:.95});
const sphere=new THREE.SphereGeometry(1,40,28);
function ell(parent,m,x,y,z,sx,sy,sz,rz=0){const o=new THREE.Mesh(sphere,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.z=rz;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(parent,m,x,y,z,w,h,d){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
function tube(parent,m,points,r=.02){const path=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)));const o=new THREE.Mesh(new THREE.TubeGeometry(path,40,r,10,false),m);o.castShadow=true;parent.add(o);return o;}
// Short legs, turned-out black shoes, visible soles and trouser seams.
if(snowman)ell(root,snow,0,.36,0,.51,.36,.40);
for(const side of snowman?[]:[-1,1]){
ell(root,pants,side*.23,.39,0,.205,.34,.225,side*.07);
ell(root,sole,side*.24,.06,.075,.24,.06,.33);
ell(root,shoe,side*.24,.14,.08,.235,.13,.32);
tube(root,black,[[side*.24-.14,.19,.27],[side*.24,.215,.31],[side*.24+.14,.19,.27]],.008);
tube(root,pants,[[side*.23,.22,.22],[side*.23,.39,.235],[side*.23,.59,.22]],.009);
}
ell(body,snowman?snow:pants,0,.65,0,.47,.30,.30);
ell(body,snowman?snow:black,0,1.04,0,.49,.45,.32);
// White suspenders on the front, connected into the characteristic Y on the back.
for(const side of [-1,1]){
tube(body,edge,[[side*.39,.71,.24],[side*.40,.95,.31],[side*.39,1.20,.25],[side*.31,1.43,.04]],.047);
tube(body,strap,[[side*.39,.71,.26],[side*.40,.95,.33],[side*.39,1.20,.27],[side*.31,1.43,.05]],.032);
box(body,metal,side*.39,.77,.286,.105,.10,.025);
box(body,black,side*.39,.77,.304,.061,.052,.012);
tube(body,strap,[[side*.31,1.43,.01],[side*.36,1.30,-.22],[side*.28,1.16,-.30],[0,1.04,-.33]],.034);
}
tube(body,strap,[[0,1.05,-.33],[0,.88,-.33],[0,.73,-.29]],.034);
tube(body,strap,[[-.33,1.25,.24],[0,1.19,.34],[.33,1.25,.24]],.018);
box(body,metal,0,.99,.329,.14,.19,.035);box(body,strap,0,.99,.35,.10,.15,.02);
tube(body,edge,[[-.4,.70,.20],[0,.65,.31],[.4,.70,.20]],.012);
// Thick black rolled collar, readable from all directions.
const collar=new THREE.Mesh(new THREE.TorusGeometry(.40,.105,16,64),black);collar.rotation.x=Math.PI/2;collar.scale.set(1.16,1,1);collar.position.set(0,1.43,0);body.add(collar);
ell(body,black,0,1.43,0,.53,.17,.35);
// The bright yellow head retains round cheeks and the duck-like facial silhouette.
ell(body,snowman?snow:yellow,0,1.99,0,.62,.62,.53);
for(const side of [-1,1]){
const eyeRim=ell(body,edge,side*.235,2.08,.456,.233,.269,.112);eyeRim.rotation.y=side*.10;
ell(body,white,side*.235,2.08,.48,.213,.246,.105);
// Both pupils look toward the viewer's right, as in the supplied expression reference.
ell(body,edge,side*.235+.110,2.095,.570,.069,.078,.022);
ell(body,white,side*.235+.095,2.124,.591,.016,.018,.008);
const cheek=ell(body,red,side*.475,1.84,.335,.13,.17,.063);cheek.rotation.y=side*.59;
}
ell(body,edge,0,1.78,.50,.255,.153,.19);
ell(body,orange,0,1.813,.548,.237,.103,.193);
ell(body,orange,0,1.731,.548,.218,.066,.17);
tube(body,edge,[[-.215,1.77,.616],[-.11,1.753,.72],[0,1.75,.742],[.11,1.753,.72],[.215,1.77,.616]],.012);
// Dark undercut, then distinct broad swept silver locks with a central valley.
// A continuous silver underlayer fills the scalp between locks. The front hairline
// rises in the middle and falls at the temples, retaining a clear centre part.
const hairStart=body.children.length;
const capGeometry=new THREE.SphereGeometry(1,64,32);
const capPosition=capGeometry.attributes.position,capUV=capGeometry.attributes.uv;
for(let i=0;i<capPosition.count;i++){
const phi=capUV.getX(i)*Math.PI*2;
const limit=Math.sin(phi)>0?.88+.64*Math.abs(Math.cos(phi)):1.55;
const theta=(1-capUV.getY(i))*limit;
const x=-.675*Math.cos(phi)*Math.sin(theta),z=.57*Math.sin(phi)*Math.sin(theta);
const partDip=.035*Math.exp(-x*x/.003);
capPosition.setXYZ(i,x,2.04+.67*Math.cos(theta)-partDip,z);
}
capGeometry.computeVertexNormals();
const cap=new THREE.Mesh(capGeometry,silver);cap.name='Silver_hair_cap';cap.castShadow=true;body.add(cap);
function lock(points,width,depth){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),frames=curve.computeFrenetFrames(32,false);
function shell(m,extra){const v=[],idx=[];for(let i=0;i<=32;i++){const t=i/32,p=curve.getPointAt(t),taper=.63+.37*Math.sin(Math.PI*(.12+.83*t));for(let j=0;j<=16;j++){const a=j/16*Math.PI*2,off=frames.normals[i].clone().multiplyScalar(Math.cos(a)*(width+extra)*taper).addScaledVector(frames.binormals[i],Math.sin(a)*(depth+extra));v.push(p.x+off.x,p.y+off.y,p.z+off.z);if(i<32&&j<16){const k=i*17+j;idx.push(k,k+17,k+1,k+1,k+17,k+18);}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const mesh=new THREE.Mesh(g,m);mesh.castShadow=true;body.add(mesh);}
shell(edge,.013);shell(silver,0);
}
for(const side of [-1,1]){
lock([[side*.035,2.65,.20],[side*.15,2.69,.28],[side*.30,2.54,.43],[side*.43,2.34,.49],[side*.53,2.12,.43]],.16,.085);
lock([[side*.065,2.61,.31],[side*.21,2.70,.32],[side*.39,2.58,.39],[side*.53,2.30,.43],[side*.60,2.07,.36]],.14,.075);
lock([[side*.14,2.66,.23],[side*.33,2.65,.24],[side*.51,2.44,.29],[side*.64,2.19,.27]],.17,.085);
lock([[side*.19,2.64,.10],[side*.39,2.65,.08],[side*.59,2.41,.11],[side*.70,2.14,.10],[side*.62,2.04,.03]],.15,.085);
lock([[side*.14,2.65,-.13],[side*.36,2.62,-.22],[side*.56,2.39,-.28],[side*.61,2.15,-.25]],.17,.085);
lock([[side*.07,2.62,-.32],[side*.24,2.51,-.48],[side*.41,2.28,-.48],[side*.43,2.12,-.40]],.16,.075);
tube(body,edge,[[side*.12,2.675,.37],[side*.27,2.695,.40],[side*.42,2.49,.46],[side*.53,2.22,.47]],.011);
tube(body,edge,[[side*.1,2.66,-.36],[side*.25,2.54,-.53],[side*.37,2.33,-.54]],.012);
}
tube(body,edge,[[0,2.43,-.48],[0,2.62,-.26],[0,2.675,0],[0,2.59,.30],[0,2.48,.43]],.012);
for(const part of body.children.slice(hairStart))part.userData.isHair=true;
// Arms are separate articulated groups; the right hand follows the bouncing ball.
const dribbleArm=new THREE.Group();dribbleArm.position.set(-.43,1.20,0);body.add(dribbleArm);
ell(dribbleArm,black,-.15,-.14,.02,.17,.29,.19,-.65);ell(dribbleArm,black,-.29,-.35,.12,.145,.19,.15,-.3);
for(let i=0;i<3;i++)tube(dribbleArm,sole,[[-.39+i*.07,-.40,.22],[-.39+i*.07,-.46,.24]],.009);
const balanceArm=new THREE.Group();balanceArm.position.set(.43,1.17,0);body.add(balanceArm);ell(balanceArm,black,.15,-.22,.015,.16,.36,.19,.35);ell(balanceArm,black,.23,-.47,.07,.14,.15,.13);
// Size the entire stationary figure, not the ball, to the requested stature.
root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),height=bounds.max.y-bounds.min.y;
const size=1.9/height;root.scale.setScalar(size);root.userData={heightMetres:1.9,referenceHoopHeightMetres:3,location:'First basketball court, field-side basket'};
// Ball is a regulation-scale 24 cm diameter sphere with actual raised seam geometry.
const ballGroup=new THREE.Group();ballGroup.name='Animated_basketball_24cm';campus.add(ballGroup);
const rubber=mat('#bd6627',.9);rubber.bumpMap=texture((c,w,h)=>{c.fillStyle='#999';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=7)for(let x=0;x<w;x+=7){c.fillStyle='#444';c.beginPath();c.arc(x+(y%14?3:0),y,1.6,0,7);c.fill();}},256,128);rubber.bumpMap.colorSpace=THREE.NoColorSpace;rubber.bumpScale=.0012;
ell(ballGroup,rubber,0,0,0,.12,.12,.12);
for(let j=0;j<3;j++){const seam=new THREE.Mesh(new THREE.TorusGeometry(.1202,.0018,5,96),edge);if(j===1)seam.rotation.y=Math.PI/2;if(j===2)seam.rotation.x=Math.PI/2;ballGroup.add(seam);}
for(const side of [-1,1]){const points=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;const y=Math.sin(a)*.115,x=side*(.045+.035*Math.cos(a*2)),z=Math.cos(a)*Math.sqrt(Math.max(0,.1203**2-x*x));points.push([x,y*.90,z]);}tube(ballGroup,edge,points,.0018);}
const glow=new THREE.SpotLight(0xffe7c4,90,16,Math.PI/5,.8,2);glow.position.set(origin[0]-3,5.5,origin[2]+2);glow.target.position.set(origin[0],1,origin[2]);if(!snowman)nightLighting.add(glow,glow.target);
let challenge=false;let running=true,lastTime=null,elapsed=0;
function update(time){if(challenge){lastTime=time;return;}if(lastTime!==null&&running)elapsed+=Math.min(.08,time-lastTime);lastTime=time;
const phase=elapsed*2*Math.PI/1.05,lift=(1+Math.cos(phase))/2;
ballGroup.position.set(origin[0]-.76*size,origin[1]+(snowman?.59:.12+.36*lift),origin[2]+.16);
ballGroup.rotation.set(elapsed*1.2,.2,elapsed*.9);
dribbleArm.rotation.x=snowman?-.3:-.18-.35*lift;dribbleArm.rotation.z=snowman?0:-.06+.25*(1-lift);
body.position.y=snowman?0:-.028*(1-lift);balanceArm.rotation.x=.08+Math.sin(phase)*.05;
}
update(0);
return {root,update,setChallenge(v){challenge=v;ballGroup.visible=!v;if(!v){dribbleArm.rotation.x=0;}},poseShot(v){dribbleArm.rotation.x=v?-2.1:-.2;balanceArm.rotation.x=v?-1.7:.08;},toggle(){running=!running;return running;},height:1.9};
}
