const members = [
  {
    name: "Atul",
    role: "Video Editor",
    color: "var(--amber)",
    bio: "The one behind the edit. Creative, hardworking, and impossible to rattle — the calm in every group's chaos."
  },
  {
    name: "Omkar",
    role: "The Constant",
    color: "var(--sky)",
    bio: "Runs quiet but reliable. The one who actually remembers the plan when everyone else has forgotten it existed."
  },
  {
    name: "Ajay",
    role: "Chaos, Managed",
    color: "var(--coral)",
    bio: "Owner of the group's most legendary gaming chair. Master of the spontaneous plan and the 2am idea."
  },
  {
    name: "Abhijeet",
    role: "Video Editor",
    color: "var(--violet)",
    bio: "Learning the edit alongside Atul, and somehow already the one everyone goes to when they need to talk something through."
  },
  {
    name: "Om",
    role: "Graphic Designer",
    color: "var(--lime)",
    bio: "Turns ideas into visuals that actually look good. Currently on the hunt for the opportunity that matches the talent."
  },
  {
    name: "Akshat",
    role: "Problem Solver",
    color: "var(--teal)",
    bio: "Always three trends ahead, with an AI tool ready for literally anything you throw at him."
  }
];

function initials(n){
  return n.slice(0,2).toUpperCase();
}

const grid = document.getElementById('cardGrid');

members.forEach((m, i) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.tabIndex = 0;

  const barsHtml = Array.from({length: 10}).map((_, j) => {
    const h = 6 + Math.round(Math.random() * 14);
    const delay = (Math.random() * 0.8).toFixed(2);
    return `<div class="b" style="height:${h}px; background:${m.color}; animation-delay:${delay}s"></div>`;
  }).join('');

  card.innerHTML = `
    <div class="card-top">
      <div class="track-no">0${i+1}</div>
      <div class="avatar" style="background:${m.color}">${initials(m.name)}</div>
      <div class="name-block">
        <div class="name">${m.name}</div>
        <div class="role" style="color:${m.color}">${m.role}</div>
      </div>
    </div>
    <p class="bio">${m.bio}</p>
    <div class="mini-wave">${barsHtml}</div>
  `;

  grid.appendChild(card);
});

// hero waveform
const heroWave = document.getElementById('heroWave');
const heroColors = ['var(--amber)','var(--violet)','var(--teal)','var(--coral)','var(--sky)','var(--lime)'];
for(let i=0;i<40;i++){
  const bar = document.createElement('div');
  bar.className = 'bar';
  const h = 10 + Math.round(Math.random()*54);
  bar.style.height = h + 'px';
  bar.style.animationDelay = (Math.random()*1.4).toFixed(2) + 's';
  bar.style.background = heroColors[i % heroColors.length];
  heroWave.appendChild(bar);
}

// ---------- external ambient audio ----------
let audioCtx, analyser, dataArray, isPlaying = false, audioEl;

function startAudio(){
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Swap 'ambient-track.mp3' with your actual file path
    audioEl = new Audio('hit-track.mp3'); 
    audioEl.crossOrigin = "anonymous";
    audioEl.loop = true;

    const source = audioCtx.createMediaElementSource(audioEl);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }
  
  audioCtx.resume();
  audioEl.play();
  requestAnimationFrame(animateWave);
}

function stopAudio(){
  if (audioEl) {
    audioEl.pause();
  }
}

function animateWave(){
  if (!isPlaying || !analyser) return;
  analyser.getByteFrequencyData(dataArray);
  const bars = heroWave.querySelectorAll('.bar');
  bars.forEach((bar, i) => {
    const value = dataArray[i % dataArray.length];
    bar.style.animation = 'none';
    bar.style.transform = 'none';
    bar.style.height = (10 + (value / 255) * 70) + 'px';
  });
  requestAnimationFrame(animateWave);
}

// ---------- FLOATING BUTTON & AUTOPLAY LOGIC ----------
const floatBtn = document.getElementById('floatingPlayBtn');
const floatIcon = floatBtn.querySelector('.icon');
const floatText = floatBtn.querySelector('.text');

function updateButtonUI() {
  if (isPlaying) {
    floatIcon.textContent = '❚❚';
    floatText.textContent = 'PAUSE';
  } else {
    floatIcon.textContent = '▶';
    floatText.textContent = 'PLAY';
    heroWave.querySelectorAll('.bar').forEach(bar => {
      bar.style.animation = 'pulse 1.6s ease-in-out infinite';
    });
  }
}

// 1. Click anywhere on the document to start the music once
document.addEventListener('click', function initAudio() {
  if (!isPlaying) {
    isPlaying = true;
    startAudio();
    updateButtonUI();
  }
  document.removeEventListener('click', initAudio); 
}, { once: true });

// 2. Click the floating button to pause or play manually
floatBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevents this click from triggering the document click above
  
  // If audioCtx doesn't exist yet, it means they clicked the button before clicking anywhere else
  if (!audioCtx) {
    isPlaying = true;
    startAudio();
  } else {
    isPlaying = !isPlaying;
    if (isPlaying) {
      audioCtx.resume();
      audioEl.play();
      requestAnimationFrame(animateWave);
    } else {
      stopAudio();
    }
  }
  updateButtonUI();
});
