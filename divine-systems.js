/* Six practical systems for the Nu Miracles of ROM Divine Toolbox.
   The pantheon is read from gods-data.js. Scores are user inputs, not supernatural measurements.
*/
(function () {
  "use strict";
  const gods = Array.isArray(window.GODS) ? window.GODS : [];
  const $ = id => document.getElementById(id);
  const safe = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const num = (id, fallback) => { const el=$(id), v=el ? Number(el.value) : NaN; return Number.isFinite(v) ? v : fallback; };
  const god = name => gods.find(g => g.name.toLowerCase() === name.toLowerCase());
  const show = (id, html) => { const out=$(id); if(out) out.innerHTML='<div class="tool-output">'+html+'</div>'; };
  const divineNames = names => names.map(god).filter(Boolean);
  const godLine = names => {
    const found=divineNames(names);
    return found.length ? '<p class="tool-note"><strong>Gods in focus:</strong> '+found.map(g=>'<span class="god-pill">'+safe(g.name)+'</span>').join(" ")+'</p>' : "";
  };
  const decisionCriteria = [
    ["stability","Stability"],["growth","Growth"],["freedom","Freedom"],
    ["wellbeing","Wellbeing"],["connection","Relationships"],["meaning","Purpose & meaning"]
  ];
  const relationDimensions = [
    ["communication","Communication"],["trust","Trust & reliability"],["affection","Affection & care"],
    ["autonomy","Independence & boundaries"],["goals","Shared goals"],["repair","Conflict repair"]
  ];
  const harmonyAreas = [
    {id:"life",label:"Life & body",group:"Life & the Body",names:["God of Life","God of Spirit","Goddess of Heal"]},
    {id:"mind",label:"Mind & knowledge",group:"Mind, Knowledge & Imagination",names:["God of Knowledge","God of Wisdom","God of Experience"]},
    {id:"relations",label:"Relationships & society",group:"People, Society & Desire",names:["God of Relation","God of Love","Goddess of Friendship"]},
    {id:"order",label:"Order & responsibility",group:"Law, Command & Structure",names:["God of Order","God of Structure","God of Responsibility"]},
    {id:"nature",label:"Nature & world",group:"Nature & the Living World",names:["God of Nature","God of Land","God of Forest"]}
  ];

  // 2. Weighted decision comparison.
  $("decisionBtn")?.addEventListener("click", function () {
    const a=$("optionA").value.trim() || "Option A", b=$("optionB").value.trim() || "Option B";
    let sumA=0,sumB=0,sumW=0; const rows=[];
    decisionCriteria.forEach(([id,label])=>{
      const av=num("decisionA_"+id,NaN), bv=num("decisionB_"+id,NaN), w=num("decisionW_"+id,NaN);
      if([av,bv,w].every(Number.isFinite) && av>=1 && av<=5 && bv>=1 && bv<=5 && w>=1 && w<=5){
        sumA+=av*w; sumB+=bv*w; sumW+=w; rows.push({label,av,bv,w});
      }
    });
    if(rows.length!==decisionCriteria.length){show("decisionOutput","Enter valid 1–5 ratings and importance weights for all six criteria.");return;}
    const scoreA=100*sumA/(5*sumW), scoreB=100*sumB/(5*sumW), gap=Math.abs(scoreA-scoreB);
    const lead=scoreA>scoreB?a:scoreB>scoreA?b:"Neither option";
    const details=rows.map(r=>"<li>"+safe(r.label)+": "+r.av+" vs "+r.bv+" (importance "+r.w+")</li>").join("");
    show("decisionOutput","<h3>Weighted decision comparison</h3><p><strong>"+safe(a)+":</strong> "+scoreA.toFixed(1)+"/100</p><p><strong>"+safe(b)+":</strong> "+scoreB.toFixed(1)+"/100</p><p>"+(gap<0.01?"The weighted scores are tied.":safe(lead)+" leads by "+gap.toFixed(1)+" points.")+"</p><details><summary>Show scoring breakdown</summary><ul>"+details+"</ul><p class='tool-note'>Score = 100 × Σ(importance × rating) ÷ (5 × Σ importance). Ratings and weights are your judgments.</p></details><p><strong>Before deciding:</strong> What important fact is still uncertain, and what would change your mind?</p>"+godLine(["God of Wisdom","God of Worth","God of Option","God of Caution"]));
  });

  // 3. Relationship reflection using two voluntary self-assessments.
  $("relationshipBtn")?.addEventListener("click", function () {
    const nameA=$("relationshipNameA").value.trim() || "Person A", nameB=$("relationshipNameB").value.trim() || "Person B";
    let alignment=0, totalA=0, totalB=0; const rows=[];
    relationDimensions.forEach(([id,label])=>{
      const a=num("relA_"+id,NaN), b=num("relB_"+id,NaN);
      if([a,b].every(Number.isFinite) && a>=1 && a<=5 && b>=1 && b<=5){
        const match=100*(1-Math.abs(a-b)/4); alignment+=match; totalA+=a; totalB+=b; rows.push({label,a,b,match});
      }
    });
    if(rows.length!==6){show("relationshipOutput","Please enter 1–5 ratings for both people in all six dimensions.");return;}
    alignment/=6; totalA/=6; totalB/=6;
    const detail=rows.map(r=>"<li>"+safe(r.label)+": "+r.match.toFixed(0)+"% rating alignment ("+r.a+" vs "+r.b+")</li>").join("");
    show("relationshipOutput","<h3>Relationship reflection</h3><p><strong>Rating alignment:</strong> "+alignment.toFixed(1)+"%</p><p><strong>"+safe(nameA)+" average:</strong> "+totalA.toFixed(2)+"/5 · <strong>"+safe(nameB)+" average:</strong> "+totalB.toFixed(2)+"/5</p><details><summary>Compare each dimension</summary><ul>"+detail+"</ul><p class='tool-note'>Alignment(i) = 100 × [1 − |rating A − rating B| ÷ 4]. Overall alignment is the average of six dimensions.</p></details><p><strong>Reflection:</strong> Where do your experiences differ? Ask with curiosity rather than treating a difference as proof either person is wrong.</p><p class='tool-note'>This compares two voluntarily entered self-assessments. It does not measure love, loyalty, compatibility, or what someone secretly feels.</p>"+godLine(["God of Relation","God of Communication","God of Emotion","God of Love","Goddess of Friendship"]));
  });

  // 4. Budget and savings arithmetic.
  $("wealthBtn")?.addEventListener("click", function () {
    const income=num("monthlyIncome",0), fixed=num("fixedCosts",0), variable=num("variableCosts",0);
    const debt=num("debtPayments",0), saved=num("currentSavings",0), target=num("savingsTarget",0);
    if([income,fixed,variable,debt,saved,target].some(v=>v<0) || income<=0){show("wealthOutput","Enter positive monthly income and non-negative values for the other fields.");return;}
    const surplus=income-fixed-variable-debt, rate=100*surplus/income, remaining=Math.max(0,target-saved);
    const months=surplus>0?Math.ceil(remaining/surplus):Infinity;
    const currency=$("currency").value;
    const money=v=>v.toLocaleString(undefined,{style:"currency",currency:currency,maximumFractionDigits:2});
    const timeline=remaining===0?"Your current savings already meet this target.":surplus>0?"At this unchanged surplus, the simple estimate is "+months+" month(s).":"There is no positive monthly surplus, so this target has no savings timeline yet.";
    show("wealthOutput","<h3>Monthly resource picture</h3><p><strong>Monthly surplus / shortfall:</strong> "+money(surplus)+"</p><p><strong>Surplus as share of income:</strong> "+rate.toFixed(1)+"%</p><p><strong>Target remaining:</strong> "+money(remaining)+"</p><p>"+timeline+"</p><details><summary>Show the arithmetic</summary><p>Surplus = income − fixed costs − variable costs − debt payments.</p><p>Months = ceiling((target − current savings) ÷ monthly surplus), only when surplus is positive.</p><p class='tool-note'>Assumes income and expenses stay unchanged; excludes interest, fees, taxes, emergencies, and investment returns.</p></details><p><strong>Practical next step:</strong> Review a flexible expense or identify one realistic way to increase income. Protect essential needs first.</p>"+godLine(["God of Money","God of Economy","God of Value","God of Worth","God of Yield"]));
  });

  // 5. Learning path with practice time and spaced review prompts.
  $("learningBtn")?.addEventListener("click", function () {
    const topic=$("learningTopic").value.trim(), current=num("learningCurrent",0), target=num("learningTarget",5);
    const minutes=num("learningMinutes",25), days=num("learningDays",5);
    if(!topic || current<0 || current>5 || target<1 || target>5 || target<=current || minutes<5 || minutes>600 || days<1 || days>7){
      show("learningOutput","Enter a topic, current level 0–5, a higher target 1–5, 5–600 minutes per session, and 1–7 study days.");return;
    }
    const weekly=minutes*days, gap=target-current, reviews=[1,3,7,14,30];
    show("learningOutput","<h3>Your learning path</h3><p><strong>Topic:</strong> "+safe(topic)+"</p><p><strong>Starting point:</strong> "+current+"/5 · <strong>Target:</strong> "+target+"/5 · <strong>Gap:</strong> "+gap+" level(s)</p><p><strong>Practice budget:</strong> "+weekly+" minutes/week ("+(weekly/60).toFixed(1)+" hours)</p><ol><li><strong>Learn:</strong> Study one small concept for "+minutes+" minutes.</li><li><strong>Recall:</strong> Close your notes and explain it from memory.</li><li><strong>Apply:</strong> Solve a problem or create something using it.</li><li><strong>Review:</strong> Correct mistakes and record one question to investigate.</li></ol><p><strong>Suggested review checkpoints:</strong> "+reviews.map(d=>"Day "+d).join(" · ")+" after your first session.</p><p class='tool-note'>These spaced intervals are adjustable prompts, not a guaranteed mastery timeline.</p><p><strong>Progress rule:</strong> Re-rate your level after a practice week using evidence: what can you explain, recall, and do without help?</p>"+godLine(["God of Knowledge","God of Science","God of Experience","God of Memory","God of Improvement","God of Wisdom"]));
  });

  // 6. Harmony snapshot: self-rated attention compared with stated importance.
  $("harmonyBtn")?.addEventListener("click", function () {
    let weightedGap=0,totalWeight=0;
    const rows=harmonyAreas.map(area=>{
      const attention=num("harmony_"+area.id,5), importance=num("importance_"+area.id,3);
      weightedGap+=(10-attention)*importance; totalWeight+=importance;
      return Object.assign({},area,{attention,importance,gap:10-attention,weightedGap:(10-attention)*importance});
    });
    if(rows.some(r=>r.attention<0 || r.attention>10 || r.importance<1 || r.importance>5)){show("harmonyOutput","Use attention ratings 0–10 and importance ratings 1–5.");return;}
    const score=100*(1-weightedGap/(10*totalWeight));
    rows.sort((a,b)=>b.weightedGap-a.weightedGap);
    const main=rows[0], details=rows.map(r=>"<li>"+safe(r.label)+": attention "+r.attention+"/10, importance "+r.importance+"/5, gap "+r.gap+"</li>").join("");
    const related=gods.filter(g=>g.group===main.group).slice(0,4).map(g=>g.name);
    show("harmonyOutput","<h3>Divine Harmony snapshot</h3><p><strong>Weighted attention alignment:</strong> "+score.toFixed(1)+"/100</p><p><strong>Largest weighted gap:</strong> "+safe(main.label)+" (gap "+main.gap+"/10 × importance "+main.importance+").</p><details><summary>Show all five domains</summary><ul>"+details+"</ul><p class='tool-note'>Alignment = 100 × [1 − Σ(importance × (10 − attention)) ÷ (10 × Σ importance)].</p></details><p><strong>Suggested reflection:</strong> What small action would give "+safe(main.label.toLowerCase())+" more of the attention you say it deserves?</p><p class='tool-note'>This is a snapshot of your own ratings, not a moral score, diagnosis, or divine judgment.</p>"+(related.length?"<p class='tool-note'><strong>Related pantheon members:</strong> "+related.map(n=>'<span class="god-pill">'+safe(n)+'</span>').join(" ")+"</p>":""));
  });
})();
