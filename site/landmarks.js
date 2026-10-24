import * as THREE from 'three';

// User-marked locations in the reference overhead image; no geographic north assumed.
export function addLandmarks({campus,renderer,box,cyl,line,M,texture,nightLighting,lamp}){
const black=new THREE.MeshStandardMaterial({color:0x26302e,metalness:.65,roughness:.4});
const bronze=new THREE.MeshStandardMaterial({color:0xa98043,metalness:.65,roughness:.38});
const silver=new THREE.MeshStandardMaterial({color:0xe1e6e5,metalness:.88,roughness:.27});
// Broad studio-like reflections make the metal readable without external assets.
const environment=texture((c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#8ea3b2');g.addColorStop(.34,'#f9fcfc');g.addColorStop(.52,'#bcc8ca');g.addColorStop(.55,'#52605e');g.addColorStop(1,'#afb0a3');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='#ffffff';c.fillRect(w*.14,0,w*.08,h*.54);c.fillRect(w*.65,0,w*.16,h*.5);c.fillStyle='#475761';c.fillRect(w*.44,0,w*.045,h*.85);},1024,512);
environment.mapping=THREE.EquirectangularReflectionMapping;const pmrem=new THREE.PMREMGenerator(renderer);const reflections=pmrem.fromEquirectangular(environment);silver.envMap=reflections.texture;silver.envMapIntensity=.8;bronze.envMap=reflections.texture;bronze.envMapIntensity=.45;environment.dispose();pmrem.dispose();

// West entrance, looking inward toward the existing arched teaching-block bridge.
box(8,.12,164,22,.24,27,M.paving);
// Guardhouse at the north jamb, with flat cream cornices and wraparound glazing.
box(4.8,2.5,152.8,8.2,5,6.2,M.brick);
box(4.8,5.08,152.8,9.3,.48,7.3,M.cream);
box(.64,2.9,152.8,.12,3.05,4.5,M.glassLit);
box(3.55,2.9,156,.0+5.5,3.05,.12,M.glassLit);
for(const z of [150.7,152.2,154,155.05])box(.53,2.9,z,.09,3.15,.08,black);
for(const x of [1.1,2.9,4.7,6.2])box(x,2.9,156.08,.075,3.15,.08,black);
box(.52,2.25,152.8,.09,.08,4.5,black);
box(4.8,.3,152.8,8.5,.6,6.5,M.stone);
// Tall split red-brick sign pier: a narrow separated fin next to the main blade.
box(2.5,4.6,175,3.7,9.2,2.8,M.brick);
box(2.5,4.45,172.9,3.7,8.9,.55,M.brick);
box(2.5,.25,174.7,4.1,.5,4.0,M.stone);
box(.61,4.0,175,.1,5.15,1.95,bronze);
// Confirmed school name from the user's close-up: seven vertical calligraphic glyphs.
// A high-resolution color + relief map gives the dark metal lettering an engraved edge.
const plaqueText=['枣','庄','市','第','一','中','学'];
function drawPlaque(c,w,h,relief=false){
if(relief){c.fillStyle='#a0a0a0';c.fillRect(0,0,w,h);}else{
const gold=c.createLinearGradient(0,0,w,0);gold.addColorStop(0,'#a77a3d');gold.addColorStop(.25,'#d9b679');gold.addColorStop(.65,'#d0a568');gold.addColorStop(1,'#a67a41');c.fillStyle=gold;c.fillRect(0,0,w,h);
for(let i=0;i<180;i++){const x=(i*71)%w;c.strokeStyle=i%3?'rgba(116,77,37,.09)':'rgba(255,233,177,.14)';c.lineWidth=1;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+8,h*.3,x-8,h*.65,x+2,h);c.stroke();}}
c.textAlign='center';c.textBaseline='middle';c.font='150px KaiTi, STKaiti, "楷体", serif';
plaqueText.forEach((ch,i)=>{const y=102+i*178;if(relief){c.fillStyle='#414141';c.fillText(ch,w/2,y);}else{
c.strokeStyle='#4e4832';c.lineWidth=4;c.strokeText(ch,w/2+1,y+2);
c.fillStyle='#e1d9b0';c.fillText(ch,w/2-2,y-2);
c.fillStyle='#52645f';c.fillText(ch,w/2,y);
}});
}
const nameMap=texture((c,w,h)=>drawPlaque(c,w,h),384,1280);
const reliefMap=texture((c,w,h)=>drawPlaque(c,w,h,true),384,1280);reliefMap.colorSpace=THREE.NoColorSpace;
const plaqueMat=new THREE.MeshStandardMaterial({map:nameMap,bumpMap:reliefMap,bumpScale:.045,metalness:.32,roughness:.47});
const namePlate=new THREE.Mesh(new THREE.PlaneGeometry(1.91,5.1),plaqueMat);namePlate.name='枣庄市第一中学_竖排校名';namePlate.rotation.y=-Math.PI/2;namePlate.position.set(.548,4.0,175);campus.add(namePlate);
box(.57,7.5,175,.13,1.92,2.02,M.cream);
// Stylized crest geometry. Illegible lettering is deliberately not invented.
const crest=new THREE.Mesh(new THREE.TorusGeometry(.68,.065,8,48),bronze);crest.rotation.y=-Math.PI/2;crest.position.set(.44,7.5,175);campus.add(crest);
const disk=new THREE.Mesh(new THREE.CircleGeometry(.58,48),bronze);disk.rotation.y=-Math.PI/2;disk.position.set(.46,7.5,175);campus.add(disk);
line([[.37,7.13,175.23],[.37,7.4,175.35],[.37,7.83,174.92],[.37,7.53,174.79],[.37,7.25,175.08]],M.cream,.055);
// Horizontal sliding gate with open bars, wheels and a separate pedestrian gap.
for(const y of [.34,.75,2.68])box(1.65,y,164,.17,.13,14.3,black);
for(let z=156.9;z<=171.2;z+=.35)box(1.65,1.5,z,.085,2.4,.085,black);
for(const z of [157,164,171])box(1.65,1.5,z,.2,2.9,.17,black);
for(const z of [157.4,164,170.7]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.12,16),black);wheel.rotation.z=Math.PI/2;wheel.position.set(1.65,.17,z);campus.add(wheel);}
box(1.7,.03,164,.12,.04,21,M.metal);
// Pedestrian portal stays open beside the gate. Clear this opening in wall/trees too.
box(1.7,1.35,172,.22,2.7,.22,black);
lamp(10,158,4.3);lamp(10,172,4.3);
const gateLight=new THREE.PointLight(0xffd6a1,150,20,2);gateLight.position.set(3,6,173);nightLighting.add(gateLight);

// Square sculpture court, at the marked pocket above the upper U-shaped block.
const sx=54,sz=59;
box(sx,.27,sz,13.3,.3,10.5,M.paving);
box(sx,.47,sz,7.2,.18,7.2,M.stone);
const stone=new THREE.MeshStandardMaterial({color:0x865c56,roughness:.72});
const pedestalTexture=texture((c,w,h)=>{c.fillStyle='#805a55';c.fillRect(0,0,w,h);for(let i=0;i<2500;i++){const a=(i*71)%w,b=(i*137)%h;c.fillStyle=i%2?'#976f65':'#71514d';c.fillRect(a,b,1.5,1.5);}c.strokeStyle='#503d39';c.lineWidth=1.5;for(let i=0;i<=4;i++){c.beginPath();c.moveTo(i*w/4,0);c.lineTo(i*w/4,h);c.stroke();}c.beginPath();c.moveTo(0,h*.5);c.lineTo(w,h*.5);c.stroke();});stone.map=pedestalTexture;stone.color.set('#ffffff');
// Tapered square red-stone plinth, larger at its foot.
const plinthG=new THREE.CylinderGeometry(3.65,4.55,2.25,4,1,false);plinthG.rotateY(Math.PI/4);const plinth=new THREE.Mesh(plinthG,stone);plinth.position.set(sx,1.65,sz);plinth.castShadow=true;plinth.receiveShadow=true;campus.add(plinth);
box(sx,2.83,sz,5.3,.14,5.3,stone);
const statue=new THREE.Group();statue.name='Silver_two_figure_sculpture';statue.position.set(sx,2.9,sz);campus.add(statue);
function metalMesh(g){const m=new THREE.Mesh(g,silver);m.castShadow=true;m.receiveShadow=true;statue.add(m);return m;}
function ellipsoid(x,y,z,rx,ry,rz){const m=metalMesh(new THREE.SphereGeometry(1,20,14));m.position.set(x,y,z);m.scale.set(rx,ry,rz);return m;}
// Smooth tapered tubes follow expressive limbs; all figures are real 3D geometry.
function limb(points,radii){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const n=32,sides=12,frames=curve.computeFrenetFrames(n,false),vertices=[],normals=[],idx=[];
for(let i=0;i<=n;i++){const t=i/n,p=curve.getPointAt(t),u=t*(radii.length-1),k=Math.min(radii.length-2,Math.floor(u)),r=THREE.MathUtils.lerp(radii[k],radii[k+1],u-k);for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,norm=frames.normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[i],Math.sin(a));vertices.push(p.x+r*norm.x,p.y+r*norm.y,p.z+r*norm.z);normals.push(norm.x,norm.y,norm.z);if(i<n&&j<sides){const v=i*(sides+1)+j;idx.push(v,v+sides+1,v+1,v+1,v+sides+1,v+sides+2);}}}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setIndex(idx);return metalMesh(g);}
function torso(x,y,z,levels){const vertices=[],idx=[],sides=28;for(let i=0;i<levels.length;i++){const [yy,rx,rz,shift]=levels[i];for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2;vertices.push(x+Math.cos(a)*rx+(shift||0),y+yy,z+Math.sin(a)*rz);if(i<levels.length-1&&j<sides){const v=i*(sides+1)+j;idx.push(v,v+sides+1,v+1,v+1,v+sides+1,v+sides+2);}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(idx);g.computeVertexNormals();return metalMesh(g);}
function hand(x,y,z,angle=0){const palm=ellipsoid(x,y,z,.13,.23,.085);palm.rotation.z=angle;for(let i=0;i<4;i++){const spread=(i-1.5)*.09;limb([[x+spread,y+.12,z],[x+spread*1.4+Math.sin(angle)*.12,y+.35,z-.03],[x+spread*1.7+Math.sin(angle)*.2,y+.47-(i===0?.07:0),z-.08]],[.037,.03,.016]);}limb([[x-.11,y,z],[x-.26,y+.13,z],[x-.3,y+.24,z-.03]],[.055,.04,.02]);}
// Left figure: stepping legs and one uplifted arm, the other sweeping outward.
limb([[-1.65,.07,.05],[-1.6,1.03,.02],[-1.22,2.05,0],[-1.15,2.55,0]],[.15,.23,.31,.34]);
limb([[-.5,.07,.1],[-.8,1.13,.22],[-1.13,2.12,0]],[.16,.22,.3]);
ellipsoid(-1.63,.12,.18,.21,.12,.35);ellipsoid(-.5,.12,.23,.22,.12,.35);
torso(-1.18,2.1,0,[[0,.47,.29,0],[.5,.36,.23,.02],[.95,.48,.28,.02],[1.38,.67,.29,.03],[1.6,.39,.22,.03]]);
ellipsoid(-1.14,3.94,0,.3,.43,.27);limb([[-1.16,3.47,0],[-1.15,3.68,0]],[.18,.17]);
limb([[-.66,3.49,0],[-.45,4.2,-.03],[-.43,5.15,0],[-.27,5.8,.03]],[.23,.18,.12,.09]);hand(-.27,5.98,.03,-.1);
limb([[-1.73,3.42,0],[-1.92,2.91,.14],[-1.61,2.53,.38]],[.23,.16,.1]);ellipsoid(-1.59,2.47,.39,.12,.2,.09);
// Right figure: flowing skirt, lifted inner arm and outward open hand.
torso(1.15,2.37,0,[[0,.48,.3,0],[.45,.31,.23,-.08],[.92,.43,.27,-.11],[1.27,.58,.27,-.13],[1.45,.3,.2,-.14]]);
ellipsoid(1.01,4.0,0,.29,.42,.26);limb([[1.02,3.62,0],[1.01,3.77,0]],[.17,.15]);
limb([[.53,3.58,0],[.25,4.3,-.02],[.08,5.15,0],[.02,5.8,.02]],[.22,.17,.12,.085]);hand(.02,5.98,.02,.12);
limb([[1.53,3.58,0],[2.05,3.98,.04],[2.52,4.65,.05],[2.79,4.9,.03]],[.22,.17,.12,.08]);hand(2.84,5.02,.03,-.5);
// Sculptural skirt folds open into a large arch, echoing the reference's ribbon forms.
limb([[.3,.08,.1],[.23,.9,.05],[.0,1.72,.12],[.6,2.3,.05],[1.13,2.53,0]],[.22,.3,.37,.48,.45]);
limb([[1.95,.08,0],[2.04,1.05,-.1],[2.02,1.8,0],[1.55,2.38,0]],[.26,.38,.6,.45]);
function ribbon(points,width){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),v=[],idx=[],n=44;for(let i=0;i<=n;i++){const t=i/n,p=curve.getPoint(t),w=width*(.65+.35*Math.sin(Math.PI*t));v.push(p.x,p.y,p.z-w/2,p.x,p.y,p.z+w/2);if(i<n){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const material=silver.clone();material.side=THREE.DoubleSide;const m=new THREE.Mesh(g,material);m.castShadow=true;statue.add(m);}
ribbon([[.1,1.58,.1],[.35,2.0,.25],[1.17,2.2,.2],[2.13,2.7,.04],[1.6,3.0,0]],1.1);
ribbon([[.33,.7,.15],[.66,1.3,.25],[1.75,1.7,.2],[2.08,2.2,.04]],.86);
// Subtle facial planes rather than a featureless ball.
for(const x of [-1.14,1.01]){const nose=metalMesh(new THREE.ConeGeometry(.075,.22,5));nose.rotation.x=Math.PI/2;nose.position.set(x,3.98,.29);ellipsoid(x,3.77,.12,.16,.12,.15);}
for(const [x,z] of [[49.8,63],[58.2,63]]){box(x,.65,z,.35,.35,.35,M.dark);const light=new THREE.SpotLight(0xffe4bf,220,22,Math.PI/5,.7,1.7);light.position.set(x,.9,z);light.target.position.set(sx,7,sz);nightLighting.add(light,light.target);}
lamp(46,60,3.6);lamp(63,60,3.6);
return {gate:[2,8,164],sculpture:[54,10,59]};
}
