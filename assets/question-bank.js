'use strict';
(async function(){
 const $=id=>document.getElementById(id), KEY='anatomy-question-bank-v1', letters=['א','ב','ג','ד'];
 let questions, answers={}, current=1, topic='all', retryIds=null;
 try {
  let questionsData;
  for (const url of ['assets/question-bank.json','../assets/question-bank.json']){
   try{const res=await fetch(url);if(res.ok){questionsData=await res.json();break;}}catch{}
  }
  if(!questionsData)throw new Error();
  questions=questionsData;
 }
 catch { $('load-status').textContent='לא הצלחנו לטעון את השאלות. נסו לרענן את העמוד.';return; }
 try {const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.version===1){for(const q of questions){const a=saved.answers?.[q.id];if(Number.isInteger(a)&&a>=0&&a<4)answers[q.id]=a;}if(questions.some(q=>q.id===saved.current))current=saved.current;if([...$('topic').options].some(o=>o.value===saved.topic))topic=saved.topic;}}
 catch { $('storage-warning').hidden=false; }
 function save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,answers,current,topic}));}catch{$('storage-warning').hidden=false;}}
 function answered(q){return Object.hasOwn(answers,q.id);}
 function state(q){return !answered(q)?'unanswered':q.excluded?'excluded':answers[q.id]===q.answer?'correct':'incorrect';}
 function visible(){return questions.filter(q=>(topic==='all'||q.topic===topic)&&(!retryIds||retryIds.includes(q.id)));}
 function render(focus=false){
  const list=visible();if(!list.some(q=>q.id===current))current=list[0]?.id||current;
  const q=list.find(q=>q.id===current), done=questions.filter(answered), scored=done.filter(q=>!q.excluded), correct=scored.filter(q=>state(q)==='correct').length;
  $('answered').textContent=done.length+'/'+questions.length;$('correct').textContent=correct;$('score').textContent=scored.length?Math.round(correct/scored.length*100)+'%':'—';$('progress').value=done.length;
  $('completion').hidden=done.length!==questions.length;$('result').textContent=`הציון שלך: ${correct} מתוך 34 (${Math.round(correct/34*100)}%). שאלה 33 אינה נכללת בציון.`;
  $('topic').value=topic;$('retry').textContent=retryIds?'בתרגול טעויות':'חזרה על טעויות';$('retry').disabled=!questions.some(q=>state(q)==='incorrect');
  $('empty').hidden=!!q;$('question').hidden=!q;
  $('question-list').replaceChildren();
  for(const item of list){const button=document.createElement('button'),s=state(item);button.textContent=item.id+(s==='correct'?' ✓':s==='incorrect'?' ×':s==='excluded'?' ?':'');button.dataset.state=s;button.setAttribute('aria-current',String(item.id===current));button.setAttribute('aria-label',`שאלה ${item.id}${s==='correct'?', תשובה נכונה':s==='incorrect'?', תשובה שגויה':s==='excluded'?', לבירור':''}`);button.onclick=()=>{current=item.id;render(true);};$('question-list').append(button);}
  if(q){
   $('question-number').textContent='שאלה '+q.id;$('question-topic').textContent=q.topic;$('group').textContent=q.group;$('question-title').textContent=q.prompt;$('excluded').hidden=!q.excluded;
   $('options').replaceChildren();
   q.options.forEach((text,i)=>{const b=document.createElement('button');b.className='option';b.disabled=answered(q);b.setAttribute('aria-pressed',String(answers[q.id]===i));const letter=document.createElement('span');letter.className='letter';letter.textContent=letters[i];const label=document.createElement('span');label.textContent=text;b.append(letter,label);
    if(answered(q)){if(answers[q.id]===i)b.classList.add('selected');if(!q.excluded&&i===q.answer)b.classList.add('correct');if(!q.excluded&&i===answers[q.id]&&i!==q.answer)b.classList.add('incorrect');const m=document.createElement('span');m.className='marker';m.textContent=q.excluded?(i===answers[q.id]?'נבחרה':''):i===q.answer?'✓ נכון':i===answers[q.id]?'× נבחרה':'';b.append(m);}
    b.onclick=()=>{if(answered(q))return;answers[q.id]=i;render();$('next').focus({preventScroll:true});};$('options').append(b);
   });
   const feedback=$('feedback');feedback.hidden=!answered(q);feedback.replaceChildren();feedback.dataset.kind=state(q);
   if(answered(q)){const title=document.createElement('strong');title.textContent=q.excluded?'סתירה במפתח — ללא שינוי בציון':state(q)==='correct'?'נכון!':'התשובה הנכונה היא '+letters[q.answer]+'׳';const p=document.createElement('p');p.textContent=q.explanation;feedback.append(title,p);if(q.reference){const a=document.createElement('a');a.href=q.reference;a.target='_blank';a.rel='noopener';a.textContent='הסבר מנגנון הכיווץ ב־OpenStax ↗';feedback.append(a);}}
   const inNotebook=!!document.getElementById('lesson-host');
   $('summary-link').href=inNotebook?'#/'+q.lesson+'/'+encodeURIComponent(q.section):'../index.html#'+q.lesson+'/'+q.section;
   if(inNotebook) $('summary-link').removeAttribute('target');
   $('summary-link').textContent='לסיכום: '+q.sectionTitle+' ↗';
   const hint=document.querySelector('.link-hint');if(hint) hint.hidden=inNotebook;
   const i=list.indexOf(q);$('position').textContent=`${i+1} מתוך ${list.length}`;$('prev').disabled=i===0;$('next').disabled=i===list.length-1;
   if(focus){$('question-title').focus({preventScroll:true});$('question').scrollIntoView({behavior:'smooth',block:'start'});}
  }
  save();
 }
 $('prev').onclick=()=>{const list=visible(),i=list.findIndex(q=>q.id===current);if(i>0){current=list[i-1].id;render(true);}};
 $('next').onclick=()=>{const list=visible(),i=list.findIndex(q=>q.id===current);if(i<list.length-1){current=list[i+1].id;render(true);}};
 $('topic').onchange=()=>{topic=$('topic').value;retryIds=null;render();};
 $('all').onclick=()=>{topic='all';retryIds=null;render();};
 $('retry').onclick=()=>{retryIds=questions.filter(q=>state(q)==='incorrect').map(q=>q.id);if(!retryIds.length)return;topic='all';for(const id of retryIds)delete answers[id];current=retryIds[0];render(true);};
 $('reset').onclick=()=>{if(!confirm('לאפס את התשובות ולהתחיל את הבוחן מחדש?'))return;answers={};current=1;topic='all';retryIds=null;render(true);};
 $('load-status').hidden=true;$('quiz').hidden=false;render();
})();
