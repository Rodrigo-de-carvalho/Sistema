// ── rep-counter.js — contador de repetições por pose (MediaPipe) ──
// JS puro (sem JSX): roda a detecção de pose na webcam, 100% no
// aparelho do usuário — nenhuma imagem sai do navegador.
// API: window.RepCounter.start(video, canvas, exerciseId, onUpdate)
//      window.RepCounter.stop()

window.RepCounter = (function () {
  let landmarker = null;
  let running    = false;
  let rafId      = null;
  let stream     = null;

  // Índices dos pontos do MediaPipe Pose (lado esquerdo, lado direito)
  const P = {
    shoulder: [11, 12],
    elbow:    [13, 14],
    wrist:    [15, 16],
    hip:      [23, 24],
    knee:     [25, 26],
    ankle:    [27, 28],
  };

  // Cada exercício mede o ângulo de uma articulação (A-B-C, ângulo em B):
  //   "armado" quando o ângulo desce abaixo de downBelow (fase de descida)
  //   conta 1 rep quando volta acima de upAbove (fase de subida completa)
  const EXERCISES = {
    push_ups: { joints: ["shoulder", "elbow", "wrist"], downBelow: 95,  upAbove: 150,
                hint: "Fique de LADO para a câmera, corpo inteiro visível" },
    squats:   { joints: ["hip", "knee", "ankle"],       downBelow: 100, upAbove: 160,
                hint: "Fique de LADO para a câmera, corpo inteiro visível" },
    abs:      { joints: ["shoulder", "hip", "knee"],    downBelow: 100, upAbove: 135,
                hint: "Deite-se de LADO para a câmera, corpo inteiro visível" },
  };

  function angleDeg(a, b, c) {
    const v1 = { x: a.x - b.x, y: a.y - b.y };
    const v2 = { x: c.x - b.x, y: c.y - b.y };
    const m1 = Math.hypot(v1.x, v1.y), m2 = Math.hypot(v2.x, v2.y);
    if (!m1 || !m2) return 180;
    const cos = Math.min(1, Math.max(-1, (v1.x * v2.x + v1.y * v2.y) / (m1 * m2)));
    return (Math.acos(cos) * 180) / Math.PI;
  }

  const vis = (p) => (p && (p.visibility === undefined ? 1 : p.visibility)) || 0;

  async function ensureLandmarker() {
    if (landmarker) return landmarker;
    const vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14");
    const files  = await vision.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    landmarker = await vision.PoseLandmarker.createFromOptions(files, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
    });
    return landmarker;
  }

  function drawSide(ctx, canvas, pts, ok) {
    ctx.strokeStyle = ok ? "rgba(0,255,136,0.9)" : "rgba(79,140,255,0.9)";
    ctx.fillStyle   = ctx.strokeStyle;
    ctx.lineWidth   = 3;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = p.x * canvas.width, y = p.y * canvas.height;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  async function start(video, canvas, exerciseId, onUpdate) {
    const cfg = EXERCISES[exerciseId];
    if (!cfg) throw new Error("Exercício não suportado pela câmera.");
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Este navegador não suporta câmera (use HTTPS ou localhost).");
    }

    onUpdate({ status: "loading-model", count: 0, detected: false, hint: cfg.hint });
    await ensureLandmarker();

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");

    let count = 0, armed = false, lastVideoTime = -1;
    running = true;

    const loop = () => {
      if (!running) return;
      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        let result = null;
        try { result = landmarker.detectForVideo(video, performance.now()); } catch {}
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const lm = result && result.landmarks && result.landmarks[0];
        if (lm) {
          // escolhe o lado (esq/dir) com articulações mais visíveis
          const score = (side) => cfg.joints.reduce((s, j) => s + vis(lm[P[j][side]]), 0);
          const side  = score(0) >= score(1) ? 0 : 1;
          const pts   = cfg.joints.map(j => lm[P[j][side]]);
          const visOk = pts.every(p => vis(p) > 0.5);

          if (visOk) {
            const ang = angleDeg(pts[0], pts[1], pts[2]);
            if (!armed && ang < cfg.downBelow) armed = true;
            else if (armed && ang > cfg.upAbove) { armed = false; count++; }
            drawSide(ctx, canvas, pts, armed);
            onUpdate({ status: "running", count, detected: true, armed,
                       angle: Math.round(ang), hint: cfg.hint });
          } else {
            onUpdate({ status: "running", count, detected: false, hint: cfg.hint });
          }
        } else {
          onUpdate({ status: "running", count, detected: false, hint: cfg.hint });
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  }

  return { start, stop, EXERCISES };
})();
