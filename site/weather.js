import * as THREE from 'three';

// All weather and audio are generated locally; no audio downloads are needed.
export function createWeather({scene,campus,renderer,M,sportMat,seasons}){
 const toggle=document.querySelector('#weather-toggle'),note=document.querySelector('#weather-note');
 let enabled=false,last=0,nextThunder=0,flashUntil=0,thunderAt=Infinity,capturePending=false;
 const rainGroup=new THREE.Group();rainGroup.name='Thunderstorm';rainGroup.visible=false;campus.add(rainGroup);
 const count=6500,positions=new Float32Array(count*6),drops=[];
 for(let i=0;i<count;i++)drops.push({x:Math.random()*332,y:Math.random()*85,z:Math.random()*280,s:20+Math.random()*12});
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const rain=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0xc3dbe9,transparent:true,opacity:.40,depthWrite:false}));rain.frustumCulled=false;rainGroup.add(rain);
 const lightning=new THREE.DirectionalLight(0xd8e7ff,0);lightning.position.set(-80,150,-70);scene.add(lightning);
 const fog=new THREE.FogExp2(0x64737d,.0016);let oldFog=null;
 const target=new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
 const reflectionCamera=new THREE.CubeCamera(.3,700,target);reflectionCamera.position.set(-49,2,65);scene.add(reflectionCamera);
 // Small normals break up reflections into soft rain ripples.
 const data=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){const k=(y*64+x)*4;data[k]=128+Math.sin(x*.8+y*.4)*13;data[k+1]=128+Math.cos(y*.9-x*.3)*13;data[k+2]=252;data[k+3]=255;}
 const ripple=new THREE.DataTexture(data,64,64);ripple.wrapS=ripple.wrapT=THREE.RepeatWrapping;ripple.needsUpdate=true;
 const puddleMaterial=new THREE.MeshPhysicalMaterial({color:0x778b96,transparent:true,opacity:.50,roughness:.12,metalness:.12,clearcoat:1,clearcoatRoughness:.08,envMap:target.texture,envMapIntensity:1,normalMap:ripple,normalScale:new THREE.Vector2(.20,.20),depthWrite:false});
 const puddles=new THREE.Group();puddles.name='Rain_puddles';rainGroup.add(puddles);
 // Only known open paved areas; no new collision or raised water surfaces.
 for(let i=0;i<28;i++){
  const x=i<18?110+(i%3)*6:90+(i%2)*5,z=i<18?164+Math.floor(i/3)*15:151+(i-18)*10;
  const shape=new THREE.Shape();for(let j=0;j<=32;j++){const a=j/32*Math.PI*2,r=1+.12*Math.sin(a*3+i)+.08*Math.cos(a*5);const px=Math.cos(a)*r,py=Math.sin(a)*r;if(j===0)shape.moveTo(px,py);else shape.lineTo(px,py);}
  const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),puddleMaterial);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=i*1.3;mesh.position.set(x,i<18?.312:.082,z);mesh.scale.set(1.3+(i%4)*.6,.6+(i%3)*.4,1);puddles.add(mesh);
 }
 const wetMaterials=[M.paving,M.asphalt,sportMat],saved=wetMaterials.map(m=>({roughness:m.roughness,metalness:m.metalness,envMap:m.envMap,envMapIntensity:m.envMapIntensity}));
 function wet(on){wetMaterials.forEach((m,i)=>{Object.assign(m,on?{roughness:i===2?.38:.25,metalness:.10,envMap:target.texture,envMapIntensity:.45}:saved[i]);m.needsUpdate=true;});}
 let audio=null,master=null,rainGain=null,noise=null;
 async function startAudio(){
  try{
   if(!audio){
    audio=new (window.AudioContext||window.webkitAudioContext)();master=audio.createGain();master.connect(audio.destination);
    noise=audio.createBuffer(1,audio.sampleRate*4,audio.sampleRate);const samples=noise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
    const source=audio.createBufferSource();source.buffer=noise;source.loop=true;
    const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=3200;rainGain=audio.createGain();rainGain.gain.value=0;source.connect(filter).connect(rainGain).connect(master);source.start();
   }
   await audio.resume();setVolume();rainGain.gain.setTargetAtTime(enabled?.22:0,audio.currentTime,.3);
  }catch{note.textContent='雷雨已开启，声音暂不可用；可再次点击开关重试。';}
 }
 function setVolume(){const value=Number(document.querySelector('#weather-volume').value);document.querySelector('#weather-volume-value').textContent=value+'%';if(master)master.gain.setTargetAtTime(enabled?value/100:0,audio.currentTime,.1);}
 function thunder(){if(!audio||!enabled)return;const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();source.buffer=noise;source.playbackRate.value=.65;filter.type='lowpass';filter.frequency.value=180;const t=audio.currentTime;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.85,t+.18);gain.gain.exponentialRampToValueAtTime(.001,t+4.7);source.connect(filter).connect(gain).connect(master);source.start();source.stop(t+5);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};}
 function setEnabled(value){
  const on=Boolean(value)&&seasons.season!=='winter';if(on===enabled)return;
  enabled=on;rainGroup.visible=on;lightning.intensity=0;flashUntil=0;thunderAt=Infinity;nextThunder=last+8+Math.random()*8;
  if(on){oldFog=scene.fog;scene.fog=fog;}else scene.fog=oldFog;
  seasons.setStorm(on);wet(on);capturePending=on;toggle.setAttribute('aria-pressed',String(on));toggle.textContent=on?'关闭雷雨':'开启雷雨';note.textContent=on?'阴天雷雨 · 雨声、远雷与地面积水':'春夏秋可用 · 阴天、雨声与湿润地面';
  if(on)void startAudio();else if(audio){rainGain.gain.setTargetAtTime(0,audio.currentTime,.15);master.gain.setTargetAtTime(0,audio.currentTime,.15);}
 }
 toggle.onclick=()=>setEnabled(!enabled);document.querySelector('#weather-volume').oninput=setVolume;
 window.addEventListener('campus-season-change',()=>{if(seasons.season==='winter')setEnabled(false);toggle.disabled=seasons.season==='winter';if(toggle.disabled)note.textContent='冬季使用飘雪，雷雨暂不可用';else if(!enabled)note.textContent='春夏秋可用 · 阴天、雨声与湿润地面';capturePending=enabled;});
 new MutationObserver(()=>{if(enabled)capturePending=true;}).observe(document.body,{attributes:true,attributeFilter:['class']});
 return {get enabled(){return enabled;},update(time){const dt=Math.min(.05,Math.max(0,time-last));last=time;if(!enabled)return;
  const night=document.body.classList.contains('night');fog.color.set(night?'#101925':'#64737d');
  if(capturePending){rainGroup.visible=false;wetMaterials.forEach(m=>{m.envMap=null;m.needsUpdate=true;});reflectionCamera.update(renderer,scene);wet(true);rainGroup.visible=true;capturePending=false;}
  for(let i=0;i<count;i++){const d=drops[i];d.y-=d.s*dt;d.x+=dt*2.5;if(d.y<.2){d.y=85;d.x=Math.random()*332;d.z=Math.random()*280;}if(d.x>332)d.x=0;const k=i*6;positions[k]=d.x;positions[k+1]=d.y;positions[k+2]=d.z;positions[k+3]=d.x-.13;positions[k+4]=d.y+1.0;positions[k+5]=d.z;}
  geometry.attributes.position.needsUpdate=true;ripple.offset.set(time*.013,time*.019);
  if(time>nextThunder){flashUntil=time+.24;thunderAt=time+1.2+Math.random()*1.5;nextThunder=time+12+Math.random()*15;}
  lightning.intensity=time<flashUntil?1.4*Math.sin((flashUntil-time)/.24*Math.PI):0;
  if(time>=thunderAt){thunderAt=Infinity;thunder();}
 }};
}
