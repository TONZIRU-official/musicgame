// ====== 基本セット ======
let audioCtx, audioBuffer, sourceNode;
let startTime = 0;
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

const lanes = 4;
const laneWidth = canvas.width / lanes;
const noteSpeed = 300; // px/秒
let notes = []; // { time: 秒, lane: 0-3 }

// ====== 音声アップロード ======
document.getElementById("audioFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
});

// ====== テスト譜面自動生成 ======
function generateTestNotes() {
  notes = [];
  const duration = audioBuffer.duration;

  for (let t = 1; t < duration; t += 0.7) {
    notes.push({
      time: t,
      lane: Math.floor(Math.random() * 4)
    });
  }
}

// ====== 再生 ======
document.getElementById("startBtn").addEventListener("click", () => {
  if (!audioBuffer) return alert("音声ファイルを選んでね");

  generateTestNotes();

  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.connect(audioCtx.destination);
  startTime = audioCtx.currentTime;
  sourceNode.start();

  requestAnimationFrame(gameLoop);
});

// ====== キー判定 ======
let pressed = [false, false, false, false];
const keyMap = { "f":0, "g":1, "h":2, "j":3 };

document.addEventListener("keydown", (e)=>{
  if (keyMap[e.key] !== undefined) pressed[keyMap[e.key]] = true;
});
document.addEventListener("keyup", (e)=>{
  if (keyMap[e.key] !== undefined) pressed[keyMap[e.key]] = false;
});

// ====== 描画ループ ======
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // レーン描画
  for (let i = 0; i < lanes; i++) {
    ctx.fillStyle = pressed[i] ? "#666" : "#333";
    ctx.fillRect(i * laneWidth, 500, laneWidth - 2, 20);
  }

  const currentTime = audioCtx.currentTime - startTime;

  // ノーツ描画
  notes.forEach(n => {
    const timeToHit = n.time - currentTime;
    const y = 500 - timeToHit * noteSpeed;

    ctx.fillStyle = "#0af";
    ctx.fillRect(
      n.lane * laneWidth + 10,
      y,
      laneWidth - 20,
      20
    );
  });

  requestAnimationFrame(gameLoop);
}
