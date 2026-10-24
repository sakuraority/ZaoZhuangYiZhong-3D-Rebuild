const tracks={spring:'起风了（旧版） · 买辣椒也用券',summer:'有何不可 · 许嵩',autumn:'The truth that you leave · Pianoboy高至豪',winter:'sacred play secret place · matryoshka'};
const audio=new Audio();audio.loop=true;audio.volume=.3;audio.preload='auto';
let current='',pausedByUser=false,revision=0;
const button=document.querySelector('#music-toggle'),title=document.querySelector('#music-title'),status=document.querySelector('#music-status');
async function play(){const token=revision;try{await audio.play();if(token===revision)status.textContent='单曲循环';}catch(e){console.error('Music playback:',e.name,e.message);if(token===revision&&e.name!=='AbortError')status.textContent='点击播放，开始聆听';}}
audio.addEventListener('play',()=>{status.textContent='单曲循环';button.textContent='暂停音乐';button.setAttribute('aria-pressed','true');});
audio.addEventListener('pause',()=>{button.textContent='播放音乐';button.setAttribute('aria-pressed','false');});
audio.addEventListener('error',()=>{status.textContent='音频加载失败，请刷新重试';});
button.onclick=()=>{pausedByUser=!audio.paused;if(pausedByUser){audio.pause();status.textContent='已暂停';}else play();};
document.querySelector('#music-volume').oninput=e=>{audio.volume=Number(e.target.value)/100;document.querySelector('#music-volume-value').textContent=e.target.value+'%';};
function change(season){if(!tracks[season]||season===current)return;current=season;revision++;audio.src='./audio/'+season+'.mp3';title.textContent=tracks[season];status.textContent=pausedByUser?'已暂停':'正在加载…';if(!pausedByUser)play();}
window.addEventListener('campus-season-change',e=>change(e.detail));
change(document.body.dataset.season||'spring');
