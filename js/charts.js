/* ============================================================
   charts.js — Canvas line charts for Heart Rate / SpO2 / Temp
   ============================================================ */

function genSeries(base, variance, points, seedShift=0){
  const arr = [];
  let v = base;
  for(let i=0;i<points;i++){
    v += (Math.sin(i/3 + seedShift) * variance) + (Math.random()-0.5) * variance;
    arr.push(Math.round(v*10)/10);
  }
  return arr;
}

const RANGE_POINTS = { today: 12, yesterday: 12, week: 7, month: 30 };

function buildRangeData(range){
  const points = RANGE_POINTS[range] || 12;
  return {
    labels: Array.from({length: points}, (_,i)=> range==="week" ? `Day ${i+1}` : range==="month" ? `${i+1}` : `${(i*2)}:00`),
    hr: genSeries(84, 8, points, 0),
    spo2: genSeries(96, 2, points, 1),
    temp: genSeries(37, 0.5, points, 2),
  };
}

function drawLineChart(canvas, values, color, opts={}){
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const w = rect.width, h = rect.height;
  const pad = 24;
  const min = Math.min(...values) - (opts.pad || 4);
  const max = Math.max(...values) + (opts.pad || 4);

  ctx.clearRect(0,0,w,h);

  // Grid lines
  ctx.strokeStyle = "rgba(120,150,220,0.15)";
  ctx.lineWidth = 1;
  for(let i=0;i<=4;i++){
    const y = pad + ((h-pad*2) / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w-pad, y); ctx.stroke();
  }

  const stepX = (w - pad*2) / (values.length - 1);
  const toY = (val)=> pad + (h - pad*2) * (1 - (val - min) / (max - min));

  // Animate drawing progressively
  let progress = 0;
  const totalFrames = 40;
  function frame(){
    progress++;
    const visibleCount = Math.max(2, Math.floor(values.length * (progress/totalFrames)));
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = "rgba(120,150,220,0.15)";
    for(let i=0;i<=4;i++){
      const y = pad + ((h-pad*2) / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w-pad, y); ctx.stroke();
    }

    // Area fill
    ctx.beginPath();
    ctx.moveTo(pad, toY(values[0]));
    for(let i=1;i<visibleCount;i++) ctx.lineTo(pad + stepX*i, toY(values[i]));
    ctx.lineTo(pad + stepX*(visibleCount-1), h-pad);
    ctx.lineTo(pad, h-pad);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0,pad,0,h-pad);
    grad.addColorStop(0, color + "33");
    grad.addColorStop(1, color + "00");
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(pad, toY(values[0]));
    for(let i=1;i<visibleCount;i++) ctx.lineTo(pad + stepX*i, toY(values[i]));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Dots
    ctx.fillStyle = color;
    for(let i=0;i<visibleCount;i++){
      ctx.beginPath();
      ctx.arc(pad + stepX*i, toY(values[i]), 3, 0, Math.PI*2);
      ctx.fill();
    }

    if(progress < totalFrames) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function renderHistoryCharts(range){
  const data = buildRangeData(range);
  const hrCanvas = document.querySelector("#hrChart");
  const spo2Canvas = document.querySelector("#spo2Chart");
  const tempCanvas = document.querySelector("#tempChart");
  if(hrCanvas) drawLineChart(hrCanvas, data.hr, "#ff5b6a", {pad:6});
  if(spo2Canvas) drawLineChart(spo2Canvas, data.spo2, "#2b6ff2", {pad:1.5});
  if(tempCanvas) drawLineChart(tempCanvas, data.temp, "#f2a93b", {pad:0.3});
}

document.addEventListener("DOMContentLoaded", ()=>{
  const tabs = document.querySelectorAll(".range-tabs .chip");
  if(!tabs.length) return;
  tabs.forEach(tab=>{
    tab.addEventListener("click", ()=>{
      tabs.forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
      renderHistoryCharts(tab.dataset.range);
    });
  });
  renderHistoryCharts("today");
  window.addEventListener("resize", ()=>{
    const active = document.querySelector(".range-tabs .chip.active");
    renderHistoryCharts(active ? active.dataset.range : "today");
  });
});
