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

  // ---------- generated ambient audio ----------
  let audioCtx, analyser, dataArray, isPlaying = false, schedulerId, stepIndex = 0, activeNodes = [];

  function noiseBuffer(ctx){
    const size = ctx.sampleRate * 1;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function startAudio(){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);

    // soft pad chord
    const chord = [110, 164.81, 220, 261.63, 329.63]; // A2 E3 A3 C4 E4
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    filter.connect(masterGain);

    const padGain = audioCtx.createGain();
    padGain.gain.value = 0;
    padGain.connect(filter);
    padGain.gain.linearRampToValueAtTime(0.16, audioCtx.currentTime + 3);

    chord.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (i - chord.length / 2) * 4;
      osc.connect(padGain);
      osc.start();
      activeNodes.push(osc);
    });

    // slow filter movement
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 350;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    activeNodes.push(lfo);

    window._noicesAudio = { masterGain };

    stepIndex = 0;
    schedulerId = setInterval(() => {
      const t = audioCtx.currentTime;
      if (stepIndex % 8 === 0){
        const kick = audioCtx.createOscillator();
        const kickGain = audioCtx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(120, t);
        kick.frequency.exponentialRampToValueAtTime(40, t + 0.25);
        kickGain.gain.setValueAtTime(0.35, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        kick.connect(kickGain);
        kickGain.connect(masterGain);
        kick.start(t);
        kick.stop(t + 0.3);
      }
      if (stepIndex % 4 === 2){
        const noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer(audioCtx);
        const hatFilter = audioCtx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.value = 6000;
        const hatGain = audioCtx.createGain();
        hatGain.gain.setValueAtTime(0.07, t);
        hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        noise.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(masterGain);
        noise.start(t);
        noise.stop(t + 0.08);
      }
      stepIndex = (stepIndex + 1) % 16;
    }, 260);

    requestAnimationFrame(animateWave);
  }

  function stopAudio(){
    clearInterval(schedulerId);
    activeNodes.forEach(n => { try { n.stop(); } catch (e) {} });
    activeNodes = [];
    if (audioCtx) audioCtx.close();
    audioCtx = null;
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

  const playBtn = document.getElementById('playBtn');
  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying){
      startAudio();
      playBtn.textContent = '❚❚';
      playBtn.setAttribute('aria-label', 'Pause ambient loop');
    } else {
      stopAudio();
      playBtn.textContent = '▶';
      playBtn.setAttribute('aria-label', 'Play ambient loop');
      heroWave.querySelectorAll('.bar').forEach(bar => {
        bar.style.animation = 'pulse 1.6s ease-in-out infinite';
      });
    }
  });
