import * as T from 'three';
export function addCampusLife(campus,prototype){
 const root=new T.Group();root.name='Campus_daily_life';campus.add(root);const people=[];
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.65}),yellow=mat('#e9c337'),silver=mat('#bfc7d1'),black=mat('#20252c'),white=mat('#eeeae0'),red=mat('#cd5449'),gray=mat('#8794a4'),orange=mat('#d88a39');
 const geo=new T.SphereGeometry(1,16,12);
 function ell(g,m,x,y,z,a,b,c){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(a,b,c);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function bar(g,m,a,b,r){const v=new T.Vector3(...b).sub(new T.Vector3(...a)),o=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),8),m);o.position.copy(new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());g.add(o);return o;}
 function person(x,z,type,index,y=.15){
 const g=new T.Group();root.add(g);g.position.set(x,y,z);const female=index%2===1,seated=['read','rest','cards','picnic'].includes(type);
 // Clone the actual basketball character. Geometry and materials stay shared.
 const model=prototype.clone(true);model.position.set(0,0,0);model.rotation.set(0,0,0);g.add(model);
 const body=model.children[0];body.position.set(0,seated?-.40:0,0);body.rotation.set(0,0,0);
 const arms=body.children.filter(o=>o.isGroup);arms.forEach(a=>a.rotation.set(seated?-.9:0,0,0));
 const head=new T.Group();head.position.y=1.99;body.add(head);
 body.updateMatrixWorld(true);const faceParts=body.children.filter(o=>{if(!o.isMesh)return false;const box=new T.Box3().setFromObject(o);const center=box.getCenter(new T.Vector3());return body.worldToLocal(center).y>1.58;});
 for(const part of faceParts){body.remove(part);head.add(part);part.position.y-=1.99;}
 const legs=[];for(const side of [-1,1]){const leg=new T.Group();leg.position.set(side*.23,.60,0);const parts=model.children.filter(o=>{if(!o.isMesh)return false;const box=new T.Box3().setFromObject(o);const center=model.worldToLocal(box.getCenter(new T.Vector3()));return side*center.x>0;});model.add(leg);for(const part of parts){model.remove(part);leg.add(part);part.position.sub(leg.position);}if(seated){leg.rotation.x=-1.3;leg.position.y=.20;}legs.push(leg);}
 if(female){
 for(const part of [...head.children])if(part.userData.isHair)head.remove(part);
 // One continuous scalp-to-shoulder surface, with a raised front hairline.
 function hairPoint(angle,u,offset=0){
  const rear=T.MathUtils.smoothstep(Math.cos(angle),-.20,.20);
  const limit=T.MathUtils.lerp(.88+.64*Math.abs(Math.sin(angle)),Math.PI/2,rear);
  const theta=Math.min(1,u/.56)*limit,tail=Math.max(0,(u-.56)/.44)*rear;
  const rx=.678*Math.sin(theta)-.065*tail,rz=.585*Math.sin(theta)-.025*tail;
  return new T.Vector3(Math.sin(angle)*(rx+offset),.05+.675*Math.cos(theta)-.79*tail+offset*(1-Math.min(1,u/.56)),-Math.cos(angle)*(rz+offset));
 }
 const positions=[],indices=[];for(let row=0;row<=48;row++)for(let col=0;col<=80;col++){positions.push(...hairPoint(col/80*Math.PI*2,row/48).toArray());if(row<48&&col<80){const k=row*81+col;indices.push(k,k+81,k+1,k+1,k+81,k+82);}}
 const hairGeometry=new T.BufferGeometry();hairGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));hairGeometry.setIndex(indices);hairGeometry.computeVertexNormals();const hairMaterial=silver.clone();hairMaterial.side=T.DoubleSide;const hairMesh=new T.Mesh(hairGeometry,hairMaterial);hairMesh.name='Continuous_long_hair';hairMesh.castShadow=true;head.add(hairMesh);
 for(let strand=0;strand<22;strand++){const angle=strand/22*Math.PI*2,points=[];const rear=T.MathUtils.smoothstep(Math.cos(angle),-.20,.20),end=rear>.001?1:.56;for(let j=0;j<=48;j++)points.push(hairPoint(angle,.045+(end-.045)*j/48,.008));const line=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),56,.006,6,false),black);line.name='Continuous_hair_strand';head.add(line);}
 }
 if(type==='read'){const book=new T.Mesh(new T.BoxGeometry(.33,.025,.24),mat('#416b86'));book.position.set(0,.42,.32);g.add(book);}
 let racketContact=null;
 if(type==='badminton'){const racket=new T.Group();racket.position.set(.23,-.47,.07);arms[1].add(racket);bar(racket,black,[0,.06,0],[0,-.12,0],.025);bar(racket,silver,[0,-.10,0],[0,-.44,0],.014);const ring=new T.Mesh(new T.TorusGeometry(.205,.016,8,40),silver);ring.position.y=-.64;racket.add(ring);for(let i=-4;i<=4;i++){const offset=i*.04,span=Math.sqrt(.195**2-offset**2);bar(racket,white,[-span,-.64+offset,0],[span,-.64+offset,0],.003);bar(racket,white,[offset,-.64-span,0],[offset,-.64+span,0],.003);}racketContact=new T.Object3D();racketContact.position.set(0,-.64,0);racket.add(racketContact);}
 const p={g,body,head,arms,legs,type,index,x,z,racketContact};people.push(p);return p;}
 let id=0;for(let i=0;i<6;i++)person(0,0,'run',id++);
 for(let i=0;i<4;i++)person(0,0,'walk',id++);
 const sports=[person(291,112,'badminton',id++),person(291,120,'badminton',id++)];sports[1].g.rotation.y=Math.PI;
 const footballers=[[247,185],[256,190],[264,181],[254,174]].map(([x,z])=>person(x,z,'football',id++));
 for(let i=0;i<4;i++){const a=i*Math.PI/2,p=person(284+Math.sin(a)*1.15,204+Math.cos(a)*1.15,'cards',id++);p.g.rotation.y=a+Math.PI;}
 for(let i=0;i<4;i++){const a=i*Math.PI/2,p=person(284+Math.sin(a)*1.4,145+Math.cos(a)*1.4,'picnic',id++);p.g.rotation.y=a+Math.PI;}
 const blanket=new T.Mesh(new T.PlaneGeometry(2.1,2.1),mat('#ba8e75'));blanket.rotation.x=-Math.PI/2;blanket.position.set(284,.153,145);root.add(blanket);
 for(let i=0;i<18;i++){const c=new T.Mesh(new T.BoxGeometry(.07,.005,.10),i%3?white:orange);c.position.set(284+Math.sin(i*2.4)*.4,.155+i*.002,204+Math.cos(i*2.4)*.4);c.rotation.y=i;root.add(c);}
 for(let i=0;i<3;i++){ell(root,white,283.5+i*.4,.30,145,.06,.15,.06);ell(root,orange,283.6+i*.3,.20,144.6,.11,.045,.10);}
 const football=ell(root,white,254,.28,183,.13,.13,.13);football.name='Passing_football';for(let i=0;i<6;i++){const patch=ell(football,black,Math.sin(i)*.85,Math.cos(i)*.85,0,.24,.24,.24);}
 const shuttle=ell(root,white,291,2,116,.045,.09,.045);
 function track(a,rx=52,rz=101){return [267+Math.sin(a)*rx,157+Math.cos(a)*rz];}
 return {root,update(t,{season,storm,night}){root.visible=!storm;if(!root.visible)return;people.forEach(p=>{const {g,type,index,arms,legs,body}=p;const moving=type==='run'||type==='walk';g.visible=season==='winter'?moving:night?moving||type==='rest':true;if(moving){const running=type==='run',pair=running?index:Math.floor((index-6)/2),a=pair*1.04+t*(running?.018:.006),[x,z]=track(a,running?52:56, running?101:104);g.position.set(x+(running?0:(index%2)*.85),.15,z);g.rotation.y=Math.atan2(Math.cos(a)*52,-Math.sin(a)*101);const stride=Math.sin(t*(running?6:2.7)+pair);legs[0].rotation.x=stride*(running?.6:.3);legs[1].rotation.x=-legs[0].rotation.x;arms[0].rotation.x=-legs[0].rotation.x;arms[1].rotation.x=legs[0].rotation.x;body.position.y=Math.abs(stride)*(running?.06:.015);}else if(type==='badminton'){const phase=(t/1.6)%2,contact=index%2===0?0:1,d=Math.min(Math.abs(phase-contact),2-Math.abs(phase-contact));arms[1].rotation.x=-1.5+.6*Math.sin(Math.min(1,d)*Math.PI);g.position.y=.15;}else if(type==='football'){g.position.set(p.x,.15,p.z);g.rotation.y=Math.atan2(255-p.x,182.5-p.z);const player=footballers.indexOf(p),cycle=(t/2.6)%4,elapsed=(cycle-player+4)%4;legs[0].rotation.x=elapsed<.12?-.28*Math.sin(elapsed/.12*Math.PI):elapsed>3.90?.18*Math.sin((elapsed-3.90)/.10*Math.PI):0;}else{p.head.rotation.y=Math.sin(t*.3+index)*.12;}});
 root.children.filter(o=>o.isMesh).forEach(o=>o.visible=season!=='winter'&&!night);football.visible=shuttle.visible=blanket.visible=season!=='winter'&&!night;root.updateMatrixWorld(true);
 // Contact positions use the actual animated shoe, not a separate circle on the pitch.
 const pass=t/2.6,sender=Math.floor(pass)%4,receiver=(sender+1)%4,progress=pass%1;
 const foot=p=>{const model=p.g.children[0],point=new T.Vector3(0,-.46,.40+.13/model.scale.x);return root.worldToLocal(p.legs[0].localToWorld(point));};
 const from=foot(footballers[sender]),to=foot(footballers[receiver]);
 // Brief control at the shoe, then a rolling pass; the next cycle starts at that same shoe.
 const travel=T.MathUtils.clamp((progress-.12)/.78,0,1);
 football.position.lerpVectors(from,to,travel);football.position.y=.28;
 const direction=to.clone().sub(from).setY(0).normalize();football.quaternion.setFromAxisAngle(new T.Vector3(direction.z,0,-direction.x),t*6);
 const phase=t/1.6,leg=Math.floor(phase)%2,u=phase%1,a=root.worldToLocal(sports[leg].racketContact.getWorldPosition(new T.Vector3())),b=root.worldToLocal(sports[1-leg].racketContact.getWorldPosition(new T.Vector3()));shuttle.position.lerpVectors(a,b,u);shuttle.position.y+=Math.sin(u*Math.PI)*2;shuttle.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());
 }};
}
