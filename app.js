const config = window.PROJECTILE_CONFIG;
const text = window.PROJECTILE_CONTENT;
const byId = function (id) { return document.getElementById(id); };
const speedSlider = byId("speed");
const angleSlider = byId("angle");
const ball = byId("ball");
const trajectory = byId("trajectory");
const playButton = byId("play-button");
const playLabel = byId("play-label");
const playIcon = byId("play-icon");
const saveThrowButton = byId("save-throw-button");
const clearThrowsButton = byId("clear-throws-button");
const savedTrajectories = byId("saved-trajectories");
const throwLegend = byId("throw-legend");
const startX = 82;
const groundY = 290;
const chartWidth = 660;
const chartHeight = 236;
const svgNamespace = "http://www.w3.org/2000/svg";
let simulation;
let scale;
let plotWidth;
let plotHeight;
let maxRange;
let maxHeight;
let animationFrame;
let animationStartedAt;
let elapsedBeforePause = 0;
let isPlaying = false;
let hasPlayed = false;
let savedThrowCount = 0;

function setText(id, value) {
  byId(id).textContent = value;
}

function formatNumber(value) {
  return value.toFixed(2).replace(".", ",");
}

function setUpPage() {
  document.title = text.title + " – Kasthöjd";
  setText("eyebrow", text.eyebrow);
  setText("page-title", text.title);
  setText("intro-copy", text.intro);
  setText("simulator-kicker", text.simulatorKicker);
  setText("simulator-title", text.simulatorTitle);
  setText("model-label", text.modelLabel);
  setText("controls-title", text.controlsTitle);
  setText("controls-hint", text.controlsHint);
  byId("position-readout").setAttribute("aria-label", text.positionLabel);
  byId("throw-legend").setAttribute("aria-label", text.legendLabel);
  savedTrajectories.setAttribute("aria-label", text.legendLabel);
  setText("speed-label", text.speed);
  setText("angle-label", text.angle);
  setText("chart-label", text.chart);
  setText("chart-units", "x, y (" + text.distanceUnit + ")");
  setText("chart-title", text.chartTitle);
  setText("chart-description", text.chartDescription);
  setText("save-throw-button", text.saveThrow);
  setText("clear-throws-button", text.clearThrows);
  setText("time-label", text.flightTime);
  setText("height-label", text.maxHeight);
  setText("range-result-label", text.range);
  setText("assumption-note", text.assumption);
  setText("lesson-kicker", text.lessonKicker);
  setText("lesson-title", text.lessonTitle);
  setText("lesson-intro", text.lessonIntro);
  setText("horizontal-title", text.horizontalTitle);
  setText("horizontal-copy", text.horizontalCopy);
  setText("vertical-title", text.verticalTitle);
  setText("vertical-copy", text.verticalCopy);
  setText("flight-title", text.flightTitle);
  setText("flight-copy", text.flightCopy);
  setText("footer-copy", text.footer);
  byId("horizontal-equation").innerHTML = text.horizontalEquation;
  byId("vertical-equation").innerHTML = text.verticalEquation;
  byId("flight-equation").innerHTML = text.flightEquation;

  speedSlider.min = config.speed.min;
  speedSlider.max = config.speed.max;
  speedSlider.step = config.speed.step;
  speedSlider.value = config.initialSpeed;
  angleSlider.min = config.angle.min;
  angleSlider.max = config.angle.max;
  angleSlider.step = config.angle.step;
  angleSlider.value = config.initialAngle;
  setText("speed-min", config.speed.min + " " + text.units);
  setText("speed-max", config.speed.max + " " + text.units);
  setText("angle-min", config.angle.min + "°");
  setText("angle-max", config.angle.max + "°");
}

function setChartScale() {
  const minAngle = Number(config.angle.min);
  const maxAngle = Number(config.angle.max);
  const bestRangeAngle = Math.min(maxAngle, Math.max(minAngle, 45));
  const heightAngles = [minAngle, maxAngle];
  if (minAngle <= 90 && maxAngle >= 90) {
    heightAngles.push(90);
  }
  const bestHeightAngle = heightAngles.reduce(function (best, angle) {
    return Math.sin(angle * Math.PI / 180) > Math.sin(best * Math.PI / 180) ? angle : best;
  });
  maxRange = window.ProjectilePhysics.calculate(config.speed.max, bestRangeAngle, config.gravity).range;
  maxHeight = window.ProjectilePhysics.calculate(config.speed.max, bestHeightAngle, config.gravity).maxHeight;
  scale = Math.min(chartWidth / maxRange, chartHeight / maxHeight);
  plotWidth = maxRange * scale;
  plotHeight = maxHeight * scale;
}

function updatePlayButton() {
  playLabel.textContent = isPlaying
    ? text.pause
    : (elapsedBeforePause > 0 ? text.resume : (hasPlayed ? text.replay : text.play));
  playIcon.textContent = isPlaying ? "Ⅱ" : "▶";
  playButton.setAttribute("aria-label", playLabel.textContent);
}

function updateSimulation() {
  stopAnimation();
  const speed = Number(speedSlider.value);
  const angle = Number(angleSlider.value);
  simulation = window.ProjectilePhysics.calculate(speed, angle, config.gravity);
  const points = [];

  for (let i = 0; i <= 80; i++) {
    const position = simulation.positionAt(simulation.flightTime * i / 80);
    const x = startX + position.x * scale;
    const y = groundY - position.y * scale;
    points.push((i === 0 ? "M" : "L") + " " + x.toFixed(1) + " " + y.toFixed(1));
  }

  trajectory.setAttribute("d", points.join(" "));
  const landingX = startX + simulation.range * scale;
  const topY = groundY - plotHeight;
  const rightX = startX + plotWidth;
  byId("x-axis").setAttribute("x2", rightX.toFixed(1));
  byId("y-axis").setAttribute("y1", String(topY));
  byId("x-axis-label").setAttribute("x", (rightX + 10).toFixed(1));
  byId("y-axis-label").setAttribute("y", String(topY - 7));
  byId("landing-marker").setAttribute("x1", landingX.toFixed(1));
  byId("landing-marker").setAttribute("x2", landingX.toFixed(1));
  byId("landing-marker").setAttribute("y1", String(topY));
  byId("landing-marker").setAttribute("y2", String(groundY));
  drawAxes();
  setText("speed-value", speed + " " + text.units);
  setText("angle-value", angle + "°");
  setText("time-result", formatNumber(simulation.flightTime) + " s");
  setText("height-result", formatNumber(simulation.maxHeight) + " m");
  setText("range-result", formatNumber(simulation.range) + " m");
  ball.setAttribute("cx", String(startX));
  ball.setAttribute("cy", String(groundY));
  updatePositionReadout({ x: 0, y: 0 }, 0);
  elapsedBeforePause = 0;
  hasPlayed = false;
  updatePlayButton();
}

function drawAxes() {
  const grid = byId("grid-lines");
  const ticks = byId("axis-ticks");
  grid.replaceChildren();
  ticks.replaceChildren();
  const topY = groundY - plotHeight;
  const rightX = startX + plotWidth;

  for (let i = 1; i < 4; i++) {
    const x = startX + plotWidth * i / 4;
    const y = groundY - plotHeight * i / 4;
    addSvgElement(grid, "line", { x1: x, y1: topY, x2: x, y2: groundY });
    addSvgElement(grid, "line", { x1: startX, y1: y, x2: rightX, y2: y });
  }

  for (let i = 0; i <= 4; i++) {
    const x = startX + plotWidth * i / 4;
    const y = groundY - plotHeight * i / 4;
    const xValue = maxRange * i / 4;
    const yValue = maxHeight * i / 4;
    addSvgElement(ticks, "line", { x1: x, y1: groundY, x2: x, y2: groundY + 5 });
    addSvgElement(ticks, "text", { x: x, y: groundY + 20, "text-anchor": "middle" }, formatNumber(xValue));
    addSvgElement(ticks, "line", { x1: startX - 5, y1: y, x2: startX, y2: y });
    addSvgElement(ticks, "text", { x: startX - 9, y: y + 4, "text-anchor": "end" }, formatNumber(yValue));
  }
}

function saveThrow() {
  const speed = Number(speedSlider.value);
  const angle = Number(angleSlider.value);
  const color = config.trajectoryColors[savedThrowCount % config.trajectoryColors.length];
  const path = document.createElementNS(svgNamespace, "path");
  path.setAttribute("d", trajectory.getAttribute("d"));
  path.setAttribute("class", "saved-trajectory");
  path.setAttribute("stroke", color);
  path.setAttribute("aria-label", speed + " m/s, " + angle + "°");
  savedTrajectories.appendChild(path);

  const legendItem = document.createElement("span");
  legendItem.className = "legend-item";
  const swatch = document.createElement("span");
  swatch.className = "legend-swatch";
  swatch.style.backgroundColor = color;
  swatch.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  label.textContent = speed + " m/s · " + angle + "°";
  legendItem.append(swatch, label);
  throwLegend.appendChild(legendItem);

  savedThrowCount++;
  clearThrowsButton.disabled = false;
}

function clearThrows() {
  savedTrajectories.replaceChildren();
  throwLegend.replaceChildren();
  savedThrowCount = 0;
  clearThrowsButton.disabled = true;
}

function addSvgElement(parent, name, attributes, content) {
  const element = document.createElementNS(svgNamespace, name);
  Object.keys(attributes).forEach(function (key) {
    element.setAttribute(key, String(attributes[key]));
  });
  if (content !== undefined) {
    element.textContent = content;
  }
  parent.appendChild(element);
}

function updatePositionReadout(position, time) {
  setText("time-position", "t = " + formatNumber(time) + " " + text.timeUnit);
  setText("x-position", "x = " + formatNumber(position.x) + " " + text.distanceUnit);
  setText("y-position", "y = " + formatNumber(Math.max(0, position.y)) + " " + text.distanceUnit);
}

function stopAnimation() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
  }
  isPlaying = false;
}

function animate(timestamp) {
  if (animationStartedAt === undefined) {
    animationStartedAt = timestamp;
  }
  const elapsed = elapsedBeforePause + (timestamp - animationStartedAt) / 1000 * config.animationSpeed;
  const time = Math.min(elapsed, simulation.flightTime);
  const position = simulation.positionAt(time);
  ball.setAttribute("cx", (startX + position.x * scale).toFixed(1));
  ball.setAttribute("cy", (groundY - position.y * scale).toFixed(1));
  updatePositionReadout(position, time);

  if (time < simulation.flightTime) {
    animationFrame = requestAnimationFrame(animate);
  } else {
    elapsedBeforePause = 0;
    animationStartedAt = undefined;
    stopAnimation();
    updatePlayButton();
  }
}

function toggleAnimation() {
  if (isPlaying) {
    elapsedBeforePause += (performance.now() - animationStartedAt) / 1000 * config.animationSpeed;
    stopAnimation();
    animationStartedAt = undefined;
  } else {
    if (elapsedBeforePause === 0) {
      ball.setAttribute("cx", String(startX));
      ball.setAttribute("cy", String(groundY));
    }
    isPlaying = true;
    hasPlayed = true;
    animationStartedAt = performance.now();
    animationFrame = requestAnimationFrame(animate);
  }
  updatePlayButton();
}

setUpPage();
setChartScale();
speedSlider.addEventListener("input", updateSimulation);
angleSlider.addEventListener("input", updateSimulation);
playButton.addEventListener("click", toggleAnimation);
saveThrowButton.addEventListener("click", saveThrow);
clearThrowsButton.addEventListener("click", clearThrows);
updateSimulation();
