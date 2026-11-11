/* Divine Council — transparent deliberation engine.
   Uses only the current pantheon records and deterministic text analysis.
   It does not invent quotations, doctrine, divine votes, or allegiances.
*/
(function () {
  "use strict";
  const gods = Array.isArray(window.GODS) ? window.GODS : [];
  const $ = id => document.getElementById(id);
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const stop = new Set(("about above after again against all also am an and any are as at be because been before being between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves").split(" "));
  const stopQuestion = new Set(["please","tell","explain","think","consider","question","matter","thing","things","someone","something","people"]);
  const tokenize = value => (String(value || "").toLowerCase().match(/[a-z0-9]+/g) || []).filter(w => w.length > 2 && !stop.has(w) && !stopQuestion.has(w));
  const unique = values => [...new Set(values)];
  const fields = g => [
    ["mastery", g.job || "", 5],
    ["role", g.role || "", 4],
    ["function", g.function || "", 3],
    ["recorded wisdom", g.wisdom || "", 2],
    ["domain group", g.group || g.class || "", 1],
    ["lineage", [...(g.parents || []), ...(g.children || [])].join(" "), 1]
  ];
  const corpus = g => [g.name, ...fields(g).map(x => x[1]), g.house || ""].join(" ");
  const stem = w => w.replace(/(ations|ation|ments|ment|ingly|edly|ing|ers|ies|es|s)$/,"");
  const termsFor = value => unique(tokenize(value).map(stem));
  const intersects = (a,b) => a.filter(x=>b.has(x));
  const chosen = new Set();

  function fieldMatches(g, queryTerms) {
    return fields(g).map(([label,value,weight])=>{
      const tokens=termsFor(value);
      const hits=intersects(tokens,new Set(queryTerms));
      return {label,value,weight,hits,score:hits.length*weight};
    }).filter(x=>x.hits.length).sort((a,b)=>b.score-a.score);
  }
  function godAnalysis(g, queryTerms) {
    const matches=fieldMatches(g,queryTerms);
    const nameHits=intersects(termsFor(g.name),new Set(queryTerms));
    const score=matches.reduce((n,x)=>n+x.score,0)+nameHits.length*6;
    const snippets=[];
    matches.forEach(m=>{
      const sentences=String(m.value).split(/(?<=[.!?])\s+/);
      const ranked=sentences.map(s=>({s,hits:intersects(termsFor(s),new Set(queryTerms)).length})).filter(x=>x.hits).sort((a,b)=>b.hits-a.hits);
      if(ranked.length) snippets.push({label:m.label,text:ranked[0].s.trim(),hits:ranked[0].hits});
      else if(m.value.trim()) snippets.push({label:m.label,text:m.value.trim(),hits:m.hits.length});
    });
    return {god:g,score,matches,snippets};
  }
  function analyzeQuestion(question) {
    const q=question.trim();
    const lower=q.toLowerCase();
    const terms=termsFor(q);
    let intent="open inquiry";
    if (/\b(should|ought|must|best|better|choose|decide|whether)\b/.test(lower)) intent="decision or value judgment";
    else if (/\b(why|cause|reason|because)\b/.test(lower)) intent="causal explanation";
    else if (/\b(how|build|make|create|implement|improve|solve)\b/.test(lower)) intent="process or practical design";
    else if (/\b(what|who|when|where|which)\b/.test(lower)) intent="definition or factual inquiry";
    const questionMark=q.includes("?");
    return {terms,intent,questionMark,wordCount:tokenize(q).length};
  }
  function recommend(question) {
    const analysis=analyzeQuestion(question);
    if(!analysis.terms.length) return [];
    const ranked=gods.map(g=>godAnalysis(g,analysis.terms)).filter(x=>x.score>0)
      .sort((a,b)=>b.score-a.score||a.god.name.localeCompare(b.god.name));
    const picked=[], groups=new Set();
    for(const item of ranked){
      const group=item.god.group||item.god.class||"Unclassified";
      if(!groups.has(group)){picked.push(item.god);groups.add(group);}
      if(picked.length===8) break;
    }
    for(const item of ranked){if(picked.length===8)break;if(!picked.includes(item.god))picked.push(item.god);}
    return picked;
  }
  function renderMembers(filter="") {
    const q=filter.toLowerCase().trim();
    $("councilMembers").innerHTML=gods.map(g=>{
      const hay=corpus(g).toLowerCase();
      if(q&&!hay.includes(q)) return "";
      const on=chosen.has(g.name);
      return '<button type="button" class="chip'+(on?' on':'')+'" data-god="'+esc(g.name)+'" aria-pressed="'+on+'">'+esc(g.name)+'</button>';
    }).join("");
    $("councilMembers").querySelectorAll("[data-god]").forEach(b=>b.addEventListener("click",()=>{
      const n=b.dataset.god;
      if(chosen.has(n)) chosen.delete(n);
      else if(chosen.size<12) chosen.add(n);
      renderMembers($("memberFilter").value);
    }));
    $("memberCount").textContent=chosen.size+" of 12 seats selected";
  }
  function seatRecommended() {
    const q=$("councilQuestion").value.trim();
    if(!q){$("councilOutput").innerHTML='<div class="tool-output">Write a question or subject first.</div>';return;}
    const rec=recommend(q);
    if(!rec.length){$("councilOutput").innerHTML='<div class="tool-output">The question has too few meaningful terms for a useful match. Try adding its subject, goal, or key concern, or select Gods manually.</div>';return;}
    chosen.clear();rec.forEach(g=>chosen.add(g.name));renderMembers($("memberFilter").value);
    $("councilOutput").innerHTML='<div class="tool-output"><h3>Suggested council</h3><p>These members were selected by weighted textual overlap, with an effort to represent different pantheon groups. This is a relevance suggestion, not a divine summons or authority ranking.</p><p>'+rec.map(g=>'<span class="god-pill">'+esc(g.name)+'</span>').join(" ")+'</p><button type="button" id="askSuggested">Begin deliberation</button></div>';
    $("askSuggested").addEventListener("click",convene);
  }
  function evidenceFor(member) {
    if(!member.snippets.length) return '<p class="tool-note">No phrase in this record matched the question terms directly. This member remains included because of the selected council, not because the engine found a strong textual match.</p>';
    return '<ul class="evidence-list">'+member.snippets.slice(0,3).map(s=>'<li><span class="evidence-label">'+esc(s.label)+'</span> — “'+esc(s.text)+'”</li>').join("")+'</ul>';
  }
  function commonGround(analyses, queryTerms) {
    const counts=new Map();
    analyses.forEach(a=>{
      const tokens=new Set(termsFor([a.god.job,a.god.role,a.god.function].join(" ")));
      tokens.forEach(t=>{if(queryTerms.includes(t))counts.set(t,(counts.get(t)||0)+1);});
    });
    return [...counts.entries()].filter(x=>x[1]>1).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,8);
  }
  const tradeoffs=[
    {a:["freedom","autonomy","choice","liberty"],b:["order","structure","rules","responsibility"],label:"individual freedom and collective order"},
    {a:["growth","development","expansion"],b:["nature","preservation","conservation","stability"],label:"growth and preservation"},
    {a:["security","safety","defense","protection"],b:["freedom","openness","access"],label:"security and openness"},
    {a:["transparency","truth","disclosure"],b:["privacy","confidentiality","secrecy"],label:"transparency and privacy"},
    {a:["efficiency","speed","productivity"],b:["wellbeing","care","health","rest"],label:"efficiency and wellbeing"},
    {a:["competition","rank","superiority"],b:["equality","fairness","cooperation"],label:"competition and fairness"}
  ];
  function detectTradeoffs(analyses, questionTerms) {
    const all=termsFor(analyses.map(a=>corpus(a.god)).join(" ")+" "+questionTerms.join(" "));
    const set=new Set(all);
    return tradeoffs.filter(pair=>pair.a.some(x=>set.has(stem(x)))&&pair.b.some(x=>set.has(stem(x))))
      .map(pair=>{
        const left=analyses.filter(a=>pair.a.some(x=>termsFor(corpus(a.god)).includes(stem(x)))).map(a=>a.god.name);
        const right=analyses.filter(a=>pair.b.some(x=>termsFor(corpus(a.god)).includes(stem(x)))).map(a=>a.god.name);
        return {label:pair.label,left,right};
      });
  }
  function groupComposition(analyses) {
    const map=new Map();
    analyses.forEach(a=>{const key=a.god.group||a.god.class||"Unclassified";map.set(key,(map.get(key)||0)+1);});
    return [...map.entries()].sort((a,b)=>b[1]-a[1]);
  }
  function synthesisPrompts(mode,intent) {
    const common=[
      ["Define the decision","State the outcome sought, the people or living things affected, and the terms that need clear definitions."],
      ["Separate facts from values","Mark what is known, what is assumed, and what depends on a value judgment."],
      ["Compare consequences","Consider short- and long-term effects, who benefits, who bears costs, and whether harms can be reversed."],
      ["Test alternatives","Compare at least two plausible paths, including doing nothing or delaying the decision where appropriate."],
      ["Choose a responsible next step","Prefer a proportionate, observable step; decide what evidence would trigger a review."]
    ];
    if(mode==="practical") return [
      ["Map constraints","List time, money, skills, legal or safety requirements, and resources that are actually available."],
      ["Identify affected parties","Include people who carry the consequences, not only decision-makers."],
      ["Build a small test","Choose a limited, reversible pilot with an owner, a measure, and a review date."],
      ["Set safeguards","Name foreseeable harms, warning signs, and a stop or escalation condition."],
      ["Review results","Compare observed outcomes with the intended outcome before expanding."]
    ];
    if(mode==="philosophical") return [
      ["Clarify definitions","Define the central concepts and identify any words carrying multiple meanings."],
      ["Expose assumptions","Ask which beliefs are being treated as facts and what would challenge them."],
      ["Identify values","Name the principles in play and where they may conflict."],
      ["Test consistency","Ask whether the same reasoning would be accepted if roles or circumstances were reversed."],
      ["Preserve the unresolved","Record what cannot yet be concluded without further evidence or a founder's decision."]
    ];
    if(mode==="creative") return [
      ["Widen the possibility space","Generate several approaches before choosing one; do not confuse imagination with established pantheon record."],
      ["Combine distinct masteries","Look for approaches that let different domains contribute without erasing their differences."],
      ["Prototype an idea","Turn the most promising possibility into a small, testable experiment."],
      ["Check unintended effects","Ask what the idea changes indirectly and who or what might be overlooked."],
      ["Keep invention labelled","Separate new proposals from existing roles, wisdom, and canonical decisions."]
    ];
    if(intent==="causal explanation") return [
      ["Define the outcome","Specify what is happening, to whom, where, and over what period."],
      ["Map possible causes","Separate direct mechanisms from contributing conditions and background factors."],
      ["Seek disconfirming evidence","Look for counterexamples and alternative explanations."],
      ["Check the evidence","Distinguish observation, correlation, interpretation, and proven cause."],
      ["State confidence honestly","Record what is supported, what is plausible, and what remains unknown."]
    ];
    return common;
  }
  function renderDeliberation(question,mode,analyses,analysis) {
    const members=analyses.map(a=>a.god);
    const groups=groupComposition(analyses);
    const shared=commonGround(analyses,analysis.terms);
    const tensions=detectTradeoffs(analyses,analysis.terms);
    const intentLine="The question reads primarily as a "+analysis.intent+".";
    const groupText=groups.map(([g,n])=>esc(g)+" ("+n+")").join(" · ");
    const perspectiveCards=analyses.map(a=>{
      const g=a.god;
      const matched=a.matches.map(m=>esc(m.label)).join(", ");
      return '<article class="speech council-perspective"><h3>'+esc(g.name)+'</h3><p class="tool-note">Textual relevance: '+a.score+' · Matching record fields: '+(matched||"none")+'</p>'+evidenceFor(a)+'<details><summary>Full recorded perspective</summary>'+(g.job?'<p><strong>Mastery:</strong> '+esc(g.job)+'</p>':"")+(g.role?'<p><strong>Role:</strong> '+esc(g.role)+'</p>':"")+(g.function?'<p><strong>Function to the Heart:</strong> '+esc(g.function)+'</p>':"")+(g.wisdom?'<p><strong>Recorded wisdom:</strong> '+esc(g.wisdom)+'</p>':'<p class="tool-note">No separate wisdom entry is recorded.</p>')+'</details></article>';
    }).join("");
    const sharedHtml=shared.length?'<ul>'+shared.map(([t,n])=>'<li><strong>'+esc(t)+'</strong> appears in relevant recorded descriptions for '+n+' council members. This is textual overlap, not proof of agreement.</li>').join("")+'</ul>':'<p>The engine found no strong repeated question-terms across multiple selected records. That may mean the council members contribute distinct lenses rather than shared vocabulary.</p>';
    const tensionHtml=tensions.length?'<ul>'+tensions.map(t=>'<li><strong>'+esc(t.label)+':</strong> related language appears in the records. Left-side matches: '+esc(t.left.join(", ")||"not explicitly represented")+'; right-side matches: '+esc(t.right.join(", ")||"not explicitly represented")+'. Treat this as a question to reconcile, not evidence that these Gods disagree.</li>').join("")+'</ul>':'<p>No predefined trade-off pattern was detected in the selected records and question. That does not mean there are no competing interests; inspect the evidence and affected parties.</p>';
    const steps=synthesisPrompts(mode,analysis.intent).map(([h,p])=>'<li><strong>'+esc(h)+':</strong> '+esc(p)+'</li>').join("");
    const unknowns=[
      "Which important facts are missing from the question?",
      "Whose perspective or affected group is not represented at this table?",
      "What evidence could prove the leading interpretation wrong?",
      "Which consequences would be difficult or impossible to reverse?"
    ];
    const unknownHtml=unknowns.map(x=>'<li>'+esc(x)+'</li>').join("");
    const verdict=mode==="creative"?"A creative proposal may be explored, but it must remain labelled as a proposal until accepted by the founder.":mode==="philosophical"?"A philosophical conclusion should state its definitions and values openly; unresolved doctrine remains unresolved.":mode==="practical"?"A practical recommendation should be tested against real constraints and safeguards before implementation.":"A balanced conclusion should show its evidence, values, trade-offs, and uncertainties rather than hiding them behind a single score.";
    return '<div class="tool-output council-report"><div class="council-report-head"><p class="kicker">Structured deliberation · not an oracle</p><h2>The Divine Council’s Deliberation</h2><p><strong>Question:</strong> '+esc(question)+'</p><p><strong>Inquiry type:</strong> '+esc(intentLine)+'</p><p><strong>Approach:</strong> '+esc(mode.charAt(0).toUpperCase()+mode.slice(1))+'</p><p class="tool-note">This analysis is deterministic text matching over the recorded pantheon fields. Relevance numbers are ranking aids only, not divine authority or confidence scores.</p></div><hr><h3>I. Council composition</h3><p>'+members.map(g=>'<span class="god-pill">'+esc(g.name)+'</span>').join(" ")+'</p><p class="tool-note">Represented groups: '+(groupText||"not recorded")+'. The Council contains '+members.length+' member(s) across '+groups.length+' group(s).</p><hr><h3>II. Each mastery’s evidence</h3>'+perspectiveCards+'<hr><h3>III. Shared language and possible common ground</h3>'+sharedHtml+'<hr><h3>IV. Questions that may require reconciliation</h3>'+tensionHtml+'<p class="tool-note">Different domains or priorities do not establish disagreement. No God’s allegiance, opinion, or vote is inferred.</p><hr><h3>V. Deliberation procedure</h3><ol>'+steps+'</ol><p><strong>Mode-specific discipline:</strong> '+esc(verdict)+'</p><hr><h3>VI. Evidence gaps and challenges</h3><ul>'+unknownHtml+'</ul><hr><h3>VII. Provisional council record</h3><p><strong>What the records support:</strong> the listed masteries, roles, functions, and any quoted wisdom shown above.</p><p><strong>What remains a proposal:</strong> any conclusion, policy, moral rule, new relationship, or divine statement generated by applying those records to this question.</p><p><strong>Next decision:</strong> identify the one missing fact or founder clarification that would most change the outcome, obtain it, then reconvene.</p><p class="tool-note">This is a structured synthesis, not literal supernatural communication, a divine vote, a fabricated quotation, or an automatically canonical answer. Wisdom entries may be draft or simulated. Existing canon is not changed.</p><div class="council-actions"><button type="button" id="copyDeliberation">Copy deliberation</button></div><p id="deliberationCopyStatus" class="tool-note" aria-live="polite"></p></div>';
  }
  function convene() {
    const question=$("councilQuestion").value.trim();
    if(!question){$("councilOutput").innerHTML='<div class="tool-output">Write a question first.</div>';return;}
    if(!chosen.size){$("councilOutput").innerHTML='<div class="tool-output">Select at least one God, or use “Suggest a council” to find relevant members.</div>';return;}
    const analysis=analyzeQuestion(question);
    if(!analysis.terms.length){$("councilOutput").innerHTML='<div class="tool-output">Add a few subject-specific words so the council can compare the question with the recorded domains.</div>';return;}
    const members=gods.filter(g=>chosen.has(g.name));
    const deliberation=members.map(g=>godAnalysis(g,analysis.terms)).sort((a,b)=>b.score-a.score||a.god.name.localeCompare(b.god.name));
    $("councilOutput").innerHTML=renderDeliberation(question,$("councilMode").value,deliberation,analysis);
    $("copyDeliberation").addEventListener("click",()=>{
      const text=$("councilOutput").innerText;
      const status=$("deliberationCopyStatus");
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(()=>status.textContent="Deliberation copied.").catch(()=>status.textContent="Copy is unavailable in this browser.");
      else status.textContent="Copy is unavailable in this browser.";
    });
    $("councilOutput").scrollIntoView({behavior:"smooth",block:"start"});
  }
  $("memberFilter").addEventListener("input",e=>renderMembers(e.target.value));
  $("suggestCouncil").addEventListener("click",seatRecommended);
  $("conveneCouncil").addEventListener("click",convene);
  $("clearCouncil").addEventListener("click",()=>{chosen.clear();renderMembers($("memberFilter").value);$("councilOutput").innerHTML="";});
  $("copyQuestion").addEventListener("click",()=>{
    const q=$("councilQuestion").value.trim();
    const status=$("copyStatus");
    if(navigator.clipboard&&q) navigator.clipboard.writeText(q).then(()=>status.textContent="Question copied.").catch(()=>status.textContent="Copy is unavailable in this browser.");
    else status.textContent="Copy is unavailable in this browser.";
  });
  renderMembers();
})();
