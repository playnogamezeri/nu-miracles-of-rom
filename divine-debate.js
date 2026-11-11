/* Genuine multi-round AI debate client for the Divine Council.
   Requires a privately configured secure gateway URL. No API key belongs here. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const stages = [
    { id: "positions", title: "Round 1 — Independent positions" },
    { id: "cross-examination", title: "Round 2 — Cross-examination" },
    { id: "replies", title: "Round 3 — Replies and rebuttals" },
    { id: "synthesis", title: "Round 4 — Chair's synthesis" }
  ];
  let running = false;
  let controller = null;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const savedUrl = (() => { try { return localStorage.getItem("romCouncilGateway") || ""; } catch (_) { return ""; } })();

  function addInterface() {
    const host = document.createElement("section");
    host.className = "council-panel";
    host.id = "aiDebatePanel";
    host.innerHTML = `
      <h2>3. Genuine AI multi-round debate</h2>
      <p>This mode sends the selected Gods' published records and your question to an AI model through a secure gateway. The model constructs distinct, record-grounded perspectives and carries arguments through four connected rounds. These are AI-generated interpretations—not literal divine speech.</p>
      <label class="field-label" for="debateGateway">Secure debate gateway URL</label>
      <input id="debateGateway" type="url" placeholder="https://your-worker.your-subdomain.workers.dev" autocomplete="url">
      <p class="tool-note">The gateway URL is saved only in this browser. Your API key must be stored as a server-side secret in the gateway. Never paste an API key here.</p>
      <div class="council-actions">
        <button type="button" id="startAIDebate">Start four-round debate</button>
        <button type="button" class="secondary" id="stopAIDebate" disabled>Stop debate</button>
      </div>
      <p id="aiDebateStatus" class="tool-note" role="status" aria-live="polite">Ready when you are.</p>
      <div id="aiDebateRounds" class="council-report" aria-live="polite"></div>
    `;
    $("councilOutput").after(host);
    $("debateGateway").value = savedUrl;
    $("startAIDebate").addEventListener("click", runDebate);
    $("stopAIDebate").addEventListener("click", () => {
      if (controller) controller.abort();
      running = false;
      $("aiDebateStatus").textContent = "Debate stopped. Completed rounds remain visible.";
      setBusy(false);
    });
  }

  function setBusy(value) {
    $("startAIDebate").disabled = value;
    $("stopAIDebate").disabled = !value;
    running = value;
  }

  function selectedRecords() {
    const selected = [...document.querySelectorAll("#councilMembers [data-god][aria-pressed='true']")].map(b => b.dataset.god);
    const all = Array.isArray(window.GODS) ? window.GODS : [];
    return all.filter(g => selected.includes(g.name)).slice(0, 12).map(g => ({
      name: g.name, job: g.job || "", role: g.role || "", function: g.function || "",
      wisdom: g.wisdom || "", group: g.group || "", class: g.class || ""
    }));
  }

  function appendRound(title, content, model) {
    const card = document.createElement("article");
    card.className = "council-perspective";
    const h = document.createElement("h3");
    h.textContent = title;
    const label = document.createElement("p");
    label.className = "tool-note";
    label.textContent = "AI-generated debate · " + model + " · interpretation, not canon";
    const body = document.createElement("div");
    body.className = "ai-round-text";
    body.style.whiteSpace = "pre-wrap";
    body.style.lineHeight = "1.7";
    body.textContent = content;
    card.append(h, label, body);
    $("aiDebateRounds").append(card);
  }

  async function runDebate() {
    if (running) return;
    const endpoint = $("debateGateway").value.trim().replace(/\/$/, "");
    const question = $("councilQuestion").value.trim();
    const council = selectedRecords();
    if (!/^https:\/\//i.test(endpoint)) {
      $("aiDebateStatus").textContent = "Enter your secure HTTPS gateway URL first.";
      return;
    }
    if (!question) { $("aiDebateStatus").textContent = "Write the council question first."; return; }
    if (!council.length) { $("aiDebateStatus").textContent = "Select at least one God in section 2 first."; return; }
    try { localStorage.setItem("romCouncilGateway", endpoint); } catch (_) {}
    controller = new AbortController();
    setBusy(true);
    $("aiDebateRounds").innerHTML = "";
    $("aiDebateStatus").textContent = "The council is assembling " + council.length + " record-grounded perspectives…";
    const transcript = [];
    const mode = $("councilMode").value;
    try {
      for (let i = 0; i < stages.length; i++) {
        if (!running) break;
        const stage = stages[i];
        $("aiDebateStatus").textContent = "Generating " + stage.title + " (" + (i + 1) + " of 4)…";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ stage: stage.id, question, mode, council, transcript })
        });
        let data;
        try { data = await response.json(); } catch (_) { throw new Error("The gateway returned an unreadable response. Check its deployment and URL."); }
        if (!response.ok) throw new Error(data.error || ("Gateway error " + response.status));
        if (!data.response) throw new Error("The gateway returned an empty debate round.");
        transcript.push({ round: stage.title, response: data.response });
        appendRound(stage.title, data.response, data.model || "configured model");
      }
      if (running) $("aiDebateStatus").textContent = "All four rounds are complete. Review the synthesis and unresolved questions above.";
      else if (transcript.length) $("aiDebateStatus").textContent = "Debate stopped after " + transcript.length + " completed round(s).";
    } catch (error) {
      if (error.name === "AbortError") $("aiDebateStatus").textContent = "Debate stopped. Completed rounds remain visible.";
      else $("aiDebateStatus").textContent = "Debate could not continue: " + error.message;
    } finally {
      setBusy(false);
      controller = null;
    }
  }

  addInterface();
})();
