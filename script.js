const daySelect = document.getElementById("daySelect");
for (let i = 1; i <= 21; i++) {
  const opt = document.createElement("option");
  opt.value = i;
  opt.text = `Day ${i}`;
  daySelect.appendChild(opt);
}

const emrData = new Array(21).fill(null);

function formatUnit(value, unit) {
  switch (unit) {
    case 'minutes': return `${value} min`;
    case 'hours': return `${value} h`;
    case 'days': return `${value} d`;
    case 'months': return `${value} m`;
    default: return `${value}`;
  }
}

document.getElementById("generateBar").addEventListener("click", () => {
  const before = parseFloat(document.getElementById("before").value);
  const after = parseFloat(document.getElementById("after").value);
  const recoveryRaw = parseFloat(document.getElementById("recovery").value);
  const unit = document.getElementById("unit").value;

  if (isNaN(before) || isNaN(after) || isNaN(recoveryRaw)) {
    alert("Please fill in all required fields.");
    return;
  }

  const recoveryHours = {
    minutes: recoveryRaw / 60,
    hours: recoveryRaw,
    days: recoveryRaw * 24,
    months: recoveryRaw * 30 * 24
  }[unit];

  const emr = (before - after) / recoveryHours;
  const dayIndex = parseInt(daySelect.value) - 1;
  emrData[dayIndex] = parseFloat(emr.toFixed(2));

  const recoveryLabel = formatUnit(recoveryRaw, unit);
  const blueX = {
    minutes: 120,
    hours: 2,
    days: 2 / 24,
    months: 2 / (24 * 30)
  }[unit];

  const traceBefore = {
    x: [0.1],
    y: [before],
    type: "bar",
    name: "Before",
    marker: { color: "#de2d26" },
    width: 0.4
  };

  const traceAfter = {
    x: [recoveryRaw],
    y: [after],
    type: "bar",
    name: "After",
    marker: { color: "#f1c40f" },
    width: 0.4,
    text: [recoveryLabel],
    textposition: "outside"
  };

  const traceIdeal = {
    x: [blueX],
    y: [5],
    type: "bar",
    name: "Ideal Recovery",
    marker: { color: "#1f77b4" },
    width: 0.4,
    text: [formatUnit(blueX.toFixed(2), unit)],
    textposition: "outside",
    opacity: 0.6
  };

  const layout = {
    xaxis: {
      title: `Recovery Duration (${unit})`,
      range: [0, Math.max(recoveryRaw, blueX) + 1],
      tickvals: [0, recoveryRaw, blueX],
      ticktext: ["0", recoveryLabel, formatUnit(blueX.toFixed(2), unit)],
    },
    yaxis: {
      title: "Emotion Level (0–10)",
      range: [0, 10],
      dtick: 2,
      showgrid: true
    },
    barmode: "group",
    margin: { t: 20, b: 60 }
  };

  Plotly.newPlot("barChart", [traceBefore, traceAfter, traceIdeal], layout, { responsive: true });
});

document.getElementById("generateEMR").addEventListener("click", () => {
  const xDays = Array.from({ length: 21 }, (_, i) => `Day ${i + 1}`);
  const yEMRs = emrData.map(v => v !== null ? v : null);

  const trace = {
    x: xDays,
    y: yEMRs,
    type: "scatter",
    mode: "lines+markers+text",
    text: yEMRs.map(v => v !== null ? v.toFixed(2) : ""),
    textposition: "top center",
    line: { color: "#1f77b4" },
    marker: { size: 8 },
    connectgaps: false
  };

  const layout = {
    title: "EMR Trend Chart",
    xaxis: {
      title: "Day",
      tickangle: -45
    },
    yaxis: {
      title: "EMR (unit/hour)",
      range: [0, 20],
      dtick: 5,
      showgrid: true
    },
    shapes: [0, 5, 10, 15, 20].map(v => ({
      type: 'line',
      x0: -0.5,
      x1: 20.5,
      y0: v,
      y1: v,
      line: { color: 'rgba(0,0,0,0.2)', width: 1, dash: 'dot' }
    })),
    margin: { t: 50, b: 100 }
  };

  Plotly.newPlot("emrChart", [trace], layout, { responsive: true });
});