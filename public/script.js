async function callApi(url, payload, resultId) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  const el = document.getElementById(resultId);
  if (el) el.textContent = data.result || data.brandVoice || data.rewrittenVoice || JSON.stringify(data.summary, null, 2) || "Error.";
}

async function generateAd() {
  await callApi("/api/assistant", {
    brandVoice: document.getElementById("brandVoice").value,
    offer: document.getElementById("offer").value,
    platform: document.getElementById("platform").value,
    objective: document.getElementById("objective").value,
    imagePrompt: document.getElementById("imagePrompt").value,
    videoScript: document.getElementById("needVideo").checked,
    shotList: document.getElementById("needShots").checked,
    critique: document.getElementById("needCritique").checked,
    conversionStrategy: document.getElementById("needStrategy").checked,
  }, "assistantResult");
}

async function createBrandVoice() {
  await callApi("/api/brandvoice", {
    brandDescription: document.getElementById("brandDescription").value,
    examples: document.getElementById("brandExamples").value,
  }, "brandVoiceResult");
}

async function rewriteBrandVoice() {
  await callApi("/api/rewritebrandvoice", {
    currentVoice: document.getElementById("currentVoice").value,
    newDirection: document.getElementById("newDirection").value,
  }, "rewriteResult");
}

async function runPredictiveLab() {
  const payload = {
    brandVoice: document.getElementById("predBrandVoice").value,
    offer: document.getElementById("predOffer").value,
    platform: document.getElementById("predPlatform").value,
    objective: document.getElementById("predObjective").value,
    budget: document.getElementById("predBudget").value,
    numVariations: document.getElementById("predVariations").value,
  };
  const res = await fetch("/api/predictive-ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  document.getElementById("predictiveSummary").textContent = JSON.stringify(data.summary, null, 2);
  const tbody = document.querySelector("#predictiveTable tbody");
  tbody.innerHTML = data.ads.map(ad => `<tr><td>${ad.headline}</td><td>${ad.score}</td></tr>`).join("");
}

