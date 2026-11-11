/* Divine Council — grounded council builder for Nu Miracles of ROM.
   Uses only existing pantheon records. It does not create doctrine or assign allegiances. */
(function () {
  "use strict";
  const gods = Array.isArray(window.GODS) ? window.GODS : [];
  const $ = id => document.getElementById(id);
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const stop = new Set(("about above after again against all also am an and any are as at be because been before being between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves").split(" "));
  const tokenize = s => (String(s).toLowerCase().match(/[a-z0-9]+/g)||[]).filter(w=>w.length>2&&!stop.has(w));
  const corpus = g => [g.name,g.job,g.role,g.function,g.group,g.class,g.house,(g.parents||[]).join(" "),(g.children||[]).join(" "),g.wisdom].filter(Boolean).join(" ");
  const score = (g, terms) => {
    const words = new Set(tokenize(corpus(g)));
    return terms.reduce((n,t)=>n+(words.has(t)?(t.length>6?3:2):0),0);
  };
  const chosen = new Set();
  let lastQuestion = "";
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
      if(chosen.has(n)) chosen.delete(n); else if(chosen.size<12) chosen.add(n);
      renderMembers($("memberFilter").value);
      $("memberCount").textContent=chosen.size+" of 12 seats selected";
    }));
    $("memberCount").textContent=chosen.size+" of 12 seats selected";
  }
  function recommend(question) {
    const terms=[...new Set(tokenize(question))];
    return gods.map(g=>({g,s:score(g,terms)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s||a.g.name.localeCompare(b.g.name)).slice(0,8).map(x=>x.g);
  }
  function seatRecommended() {
    const q=$("councilQuestion").value.trim();
    if(!q){$("councilOutput").innerHTML='<div class="tool-output">Write a question or subject first.</div>';return;}
    const rec=recommend(q);
    if(!rec.length){$("councilOutput").innerHTML='<div class="tool-output">No strong keyword match was found. Search the pantheon and select the Gods whose domains you want represented.</div>';return;}
    chosen.clear(); rec.forEach(g=>chosen.add(g.name)); renderMembers($("memberFilter").value);
    $("councilOutput").innerHTML='<div class="tool-output"><h3>Suggested council</h3><p>These existing pantheon members have the strongest textual overlap with your question. You can change the seats before asking the council.</p><p>'+rec.map(g=>'<span class="god-pill">'+esc(g.name)+'</span>').join(" ")+'</p><button type="button" id="askSuggested">Hear this council</button></div>';
    $("askSuggested").addEventListener("click", convene);
  }
  function convene() {
    const question=$("councilQuestion").value.trim();
    if(!question){$("councilOutput").innerHTML='<div class="tool-output">Write a question first.</div>';return;}
    if(!chosen.size){$("councilOutput").innerHTML='<div class="tool-output">Select at least one God, or use “Suggest a council” to find relevant members.</div>';return;}
    const members=gods.filter(g=>chosen.has(g.name));
    lastQuestion=question;
    const mode=$("councilMode").value;
    const intros={
      practical:"Translate the question into actions, constraints, resources, and consequences.",
      philosophical:"Examine definitions, assumptions, values, and what remains uncertain.",
      creative:"Explore possibilities while keeping the established record distinct from invention.",
      balanced:"Consider practical consequences, underlying values, relationships, and uncertainty."
    };
    const perspectives=members.map(g=>{
      const details=[g.job&&'<p><strong>Mastery:</strong> '+esc(g.job)+'</p>',g.role&&'<p><strong>Role:</strong> '+esc(g.role)+'</p>',g.function&&'<p><strong>Function to the Heart:</strong> '+esc(g.function)+'</p>'].filter(Boolean).join("");
      const wisdom=g.wisdom?'<details><summary>Recorded wisdom (draft or simulated where applicable)</summary><p>'+esc(g.wisdom)+'</p></details>':'<p class="tool-note">No separate wisdom entry is recorded for this God.</p>';
      return '<article class="speech"><span class="who">'+esc(g.name)+'</span>'+details+wisdom+'</article>';
    }).join("");
    const groupList=[...new Set(members.map(g=>g.group||g.class).filter(Boolean))];
    const shared=members.length===1?"One mastery is represented in this sitting.":members.length+" distinct masteries are represented across "+groupList.length+" pantheon group(s).";
    const output='<div class="tool-output"><h2>The Divine Council</h2><p><strong>Question:</strong> '+esc(question)+'</p><p><strong>Approach:</strong> '+esc(intros[mode]||intros.balanced)+'</p><h3>Who is seated</h3><p>'+members.map(g=>'<span class="god-pill">'+esc(g.name)+'</span>').join(" ")+'</p><p class="tool-note">'+esc(shared)+' Group labels: '+esc(groupList.join("; ")||"not recorded")+'.</p><hr><h3>Each mastery brought to the question</h3>'+perspectives+'<hr><h3>Collective reflection</h3><ol><li><strong>Define the matter:</strong> What exactly is being asked, and which words need a shared definition?</li><li><strong>Bring the masteries together:</strong> Read the roles above as distinct lenses. Where do they address different parts of the same question?</li><li><strong>Test the consequences:</strong> What practical effects, responsibilities, risks, and affected people or living things should be considered?</li><li><strong>Keep uncertainty visible:</strong> Which facts are missing, and what evidence or clarification would change the conclusion?</li><li><strong>Choose a next step:</strong> What is one reversible, responsible action that can be tested before making a larger commitment?</li></ol><p class="tool-note">This is a structured synthesis of the selected Gods’ recorded domains, not a literal supernatural communication, a vote, a new divine law, or an automatically canonical answer. Wisdom entries may be draft or simulated. The council does not infer or assign allegiance.</p></div>';
    $("councilOutput").innerHTML=output;
    $("councilOutput").scrollIntoView({behavior:"smooth",block:"start"});
  }
  $("memberFilter").addEventListener("input",e=>renderMembers(e.target.value));
  $("suggestCouncil").addEventListener("click",seatRecommended);
  $("conveneCouncil").addEventListener("click",convene);
  $("clearCouncil").addEventListener("click",()=>{chosen.clear();renderMembers($("memberFilter").value);$("councilOutput").innerHTML="";});
  $("copyQuestion").addEventListener("click",()=>{const q=$("councilQuestion").value.trim();if(navigator.clipboard&&q)navigator.clipboard.writeText(q).then(()=>{$("copyStatus").textContent="Question copied.";}).catch(()=>{$("copyStatus").textContent="Copy is unavailable in this browser.";});});
  renderMembers();
})();
