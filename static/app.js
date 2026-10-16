(() => {
  const $ = (id) => document.getElementById(id);
  const screens = ["homeScreen","gameScreen","resultScreen","reviewScreen"];
  const todayKey = () => new Date().toLocaleDateString("en-CA");
  const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  let stats = load("multiplicationStats", {bestScore:0,bestStreak:0,wrong:{},mastery:{},daily:{date:todayKey(),seconds:0}});
  if (!stats.mastery) stats.mastery = {};
  if (!stats.wrong) stats.wrong = {};
  let game = null, totalTimer = null, questionTimer = null, audioOn = true;
  const show = (screen) => { screens.forEach(id => $(id).classList.toggle("hidden", id !== screen)); window.scrollTo({top:0,behavior:"smooth"}); };
  const ensureDaily = () => { if (!stats.daily || stats.daily.date !== todayKey()) stats.daily = {date:todayKey(),seconds:0}; };
  const persist = () => { ensureDaily(); save("multiplicationStats",stats); renderHome(); };
  function renderHome(){
    ensureDaily();
    $("bestScore").textContent = stats.bestScore || 0;
    $("bestStreak").textContent = stats.bestStreak || 0;
    const mins = Math.min(5, Math.floor((stats.daily.seconds||0)/60));
    const pct = Math.min(100, Math.round((stats.daily.seconds||0)/300*100));
    $("dailyMinutes").textContent = `${mins} / 5 dakika`;
    $("dailyPercent").textContent = `${pct}%`;
    $("dailyProgress").style.width = `${pct}%`;
    $("reviewCount").textContent = Object.values(stats.wrong||{}).reduce((a,b)=>a+b,0);
  }
  function beep(freq=600,duration=.08){
    if(!audioOn) return;
    try { const Ctx=window.AudioContext||window.webkitAudioContext; const c=new Ctx(); const o=c.createOscillator(),g=c.createGain(); o.frequency.value=freq;o.connect(g);g.connect(c.destination);g.gain.value=.045;o.start();o.stop(c.currentTime+duration);o.onended=()=>c.close(); } catch {}
  }
  function shuffle(arr){ for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }
  function operationKey(a,b){ return [a,b].sort((x,y)=>x-y).join("×"); }
  function chooseOperation(){
    // Only factors 2–10. Treat 6×8 and 8×6 as the same skill.
    const candidates=[];
    for(let a=2;a<=10;a++) for(let b=a;b<=10;b++){
      const key=operationKey(a,b), skill=stats.mastery[key]||{};
      const hasCore=[a,b].some(n=>n>=6&&n<=9);
      const bothCore=[a,b].every(n=>n>=6&&n<=9);
      let weight=bothCore?4.2:hasCore?2.8:1;
      // Quickly mastered operations fade into the background; errors and slow answers return them to practice.
      weight *= Math.max(0.12, Math.pow(0.42, skill.fastCorrect||0));
      weight *= 1 + Math.min(8, skill.wrong||0)*1.25;
      if((skill.lastSeconds||0)>=8) weight*=1.5;
      if(game.recentKeys.includes(key)) weight*=0.025;
      candidates.push({a,b,key,weight});
    }
    // Weighted random selection, with a short no-repeat window when alternatives exist.
    let pool=candidates.filter(c=>!game.recentKeys.includes(c.key));
    if(!pool.length) pool=candidates;
    const total=pool.reduce((sum,c)=>sum+c.weight,0);
    let r=Math.random()*total, chosen=pool[pool.length-1];
    for(const c of pool){ r-=c.weight; if(r<=0){chosen=c;break;} }
    game.recentKeys.push(chosen.key);
    if(game.recentKeys.length>5) game.recentKeys.shift();
    const flip=Math.random()<0.5;
    return {a:flip?chosen.b:chosen.a,b:flip?chosen.a:chosen.b,key:chosen.key};
  }
  function makeQuestion(){
    const picked=chooseOperation();
    const {a,b,key}=picked;
    const answer=a*b, options=new Set([answer]);
    while(options.size<4){const offset=(Math.floor(Math.random()*9)+1)*(Math.random()<.5?-1:1);const v=answer+offset;if(v>=1&&v<=100)options.add(v);}
    game.question={a,b,key,answer,started:Date.now(),remaining:15};
    $("factorA").textContent=a;$("factorB").textContent=b;
    $("questionNumber").textContent=`SORU ${game.answered+1}`;
    $("questionTime").textContent="15";
    $("feedback").className="feedback";$("feedback").textContent="Doğru cevabı seç!";
    const answerEl=$("answers");answerEl.innerHTML="";
    shuffle([...options]).forEach(n=>{
      const btn=document.createElement("button");btn.className="answer-button";btn.textContent=n;
      answerEl.appendChild(btn);
    });
    clearInterval(questionTimer);
    questionTimer=setInterval(()=>{
      if(!game)return;
      const remaining=15-(Date.now()-game.question.started)/1000;
      $("questionTime").textContent=Math.max(0,Math.ceil(remaining));
      if(remaining<=0) answer(null,null);
    },100);
  }
  function answer(value,button){
    if(!game||game.locked)return;
    game.locked=true;clearInterval(questionTimer);
    const q=game.question, correct=value===q.answer;
    [...$("answers").children].forEach(btn=>{
      btn.disabled=true;
      if(Number(btn.textContent)===q.answer)btn.classList.add("correct");
      else if(button===btn&&!correct)btn.classList.add("wrong");
      else btn.classList.add("dim");
    });
    game.answered++;
    const seconds=Math.max(0,(Date.now()-q.started)/1000);
    const skill=stats.mastery[q.key]||(stats.mastery[q.key]={fastCorrect:0,wrong:0,lastSeconds:0});
    skill.lastSeconds=seconds;
    if(correct){
      game.correct++;game.streak++;game.bestStreak=Math.max(game.bestStreak,game.streak);
      if(seconds<5){ skill.fastCorrect=Math.min(5,(skill.fastCorrect||0)+1); }
      else { skill.fastCorrect=Math.max(0,(skill.fastCorrect||0)-1); }
      game.score+=Math.max(5,Math.round(15-seconds)+5);
      $("feedback").textContent="Harika! Doğru cevap 🎉";$("feedback").className="feedback good";beep(760,.1);
    }else{
      game.wrong++;game.streak=0;
      skill.wrong=(skill.wrong||0)+1;
      const key=`${q.a}×${q.b}`;
      stats.wrong[key]=(stats.wrong[key]||0)+1;
      $("feedback").textContent=`Doğru cevap: ${q.a} × ${q.b} = ${q.answer}`;$("feedback").className="feedback bad";beep(240,.14);
    }
    $("score").textContent=game.score;$("streak").textContent=game.streak;
    save("multiplicationStats",stats);
    // Briefly show the explanation, then continue automatically.
    setTimeout(()=>{if(!game)return;game.locked=false;if(Date.now()-game.startedAt>=60000)finishGame();else makeQuestion();},correct?550:1250);
  }
  function startGame(){
    clearInterval(totalTimer);clearInterval(questionTimer);
    game={score:0,correct:0,wrong:0,answered:0,streak:0,bestStreak:0,startedAt:Date.now(),locked:false,recentKeys:[]};
    $("score").textContent="0";$("streak").textContent="0";$("totalTime").textContent="60";$("totalProgress").style.width="100%";
    show("gameScreen");makeQuestion();
    totalTimer=setInterval(()=>{
      if(!game)return;
      const elapsed=(Date.now()-game.startedAt)/1000, left=Math.max(0,60-elapsed);
      $("totalTime").textContent=Math.ceil(left);$("totalProgress").style.width=`${left/60*100}%`;
      if(left<=0)finishGame();
    },100);
  }
  function finishGame(){
    if(!game)return;
    clearInterval(totalTimer);clearInterval(questionTimer);
    const finished=game;game=null;
    stats.bestScore=Math.max(stats.bestScore,finished.score);
    stats.bestStreak=Math.max(stats.bestStreak,finished.bestStreak);
    ensureDaily();stats.daily.seconds=(stats.daily.seconds||0)+Math.min(60,Math.round((Date.now()-finished.startedAt)/1000));
    persist();
    $("finalScore").textContent=finished.score;$("correctCount").textContent=finished.correct;$("wrongCount").textContent=finished.wrong;$("finalStreak").textContent=finished.bestStreak;
    $("resultTitle").textContent=finished.score>=100?"Muhteşem! 🌟":finished.score>=50?"Harika iş! 🎉":"Güzel başlangıç! 💪";
    $("resultSubtitle").textContent=finished.answered?`${finished.answered} soru denedin. Bir tur daha gelişmeni sağlayabilir!`:"Bir sonraki turda daha da iyisi!";
    show("resultScreen");
  }
  function showReview(){
    const container=$("reviewContent");container.innerHTML="";
    const entries=Object.entries(stats.wrong||{}).sort((a,b)=>b[1]-a[1]);
    if(!entries.length){container.innerHTML='<div class="empty-review"><strong>Henüz tekrar edilecek işlem yok!</strong>Oynadıkça zorlandığın işlemler burada görünecek. ✨</div>';}
    else entries.forEach(([key,count])=>{
      const [a,b]=key.split("×").map(Number);
      const item=document.createElement("div");item.className="review-item";
      const info=document.createElement("div");info.innerHTML=`<strong>${a} × ${b} = ?</strong><small>${count} kez yanlış cevaplandı</small>`;
      const btn=document.createElement("button");btn.textContent="Cevabı gör";
      btn.addEventListener("click",()=>{btn.textContent=`${a*b}`;btn.disabled=true;});
      item.append(info,btn);container.appendChild(item);
    });
    show("reviewScreen");
  }
  // Delegate answer clicks from the stable answer-grid container.
  $("answers").addEventListener("click", (event) => {
    const btn = event.target.closest("button.answer-button");
    if (!btn || btn.disabled) return;
    answer(Number(btn.textContent), btn);
  });

  $("playButton").addEventListener("click",startGame);
  $("againButton").addEventListener("click",startGame);
  $("homeButton").addEventListener("click",()=>show("homeScreen"));
  $("quitButton").addEventListener("click",()=>{if(game){clearInterval(totalTimer);clearInterval(questionTimer);game=null;}show("homeScreen");});
  $("reviewButton").addEventListener("click",showReview);
  $("reviewBackButton").addEventListener("click",()=>show("homeScreen"));
  $("soundToggle").addEventListener("click",()=>{audioOn=!audioOn;$("soundToggle").textContent=audioOn?"🔊":"🔇";});
  renderHome();
  if("serviceWorker" in navigator && location.protocol!=="file:") navigator.serviceWorker.register("/static/sw.js").catch(()=>{});
})();
