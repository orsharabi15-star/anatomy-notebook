function occlusionStyle(target,diagram){const[x,y,w,h]=target.box;return {left:100*x/diagram.size[0]+'%',top:100*y/diagram.size[1]+'%',width:100*w/diagram.size[0]+'%',height:100*h/diagram.size[1]+'%'}}
if(typeof document!=='undefined')(()=>{
 const data=JSON.parse(document.getElementById('flashcard-data').textContent),diagrams=data.occlusion,$=id=>document.getElementById(id);let selected=diagrams[0],revealed=new Set(),zoom=1;
 function canvas(host,diagram,{target=null,answer=false,interactive=false,onReveal=()=>{}}={}){
  host.replaceChildren();const board=document.createElement('div');board.className='oc-board';board.style.aspectRatio=diagram.size[0]+'/'+diagram.size[1];const img=document.createElement('img');img.src=data.media[diagram.image].src;img.alt='תרשים אנטומי עם חצים ותוויות מכוסות';img.draggable=false;board.appendChild(img);
  for(const [i,item]of diagram.targets.entries()){
   const show=interactive?revealed.has(item.id):answer&&item.id===target;const mask=document.createElement(interactive?'button':'span');mask.className='oc-mask'+(show?' oc-open':'')+(item.id===target?' oc-target':'');Object.assign(mask.style,occlusionStyle(item,diagram));mask.textContent=show?'':String(i+1);
   if(interactive){mask.type='button';mask.setAttribute('aria-label',show?'הסתרה: '+item.label:'חשיפת שם '+(i+1));mask.setAttribute('aria-pressed',String(show));mask.onclick=()=>onReveal(item)}else mask.setAttribute('aria-hidden','true');board.appendChild(mask)
  }host.appendChild(board);return board;
 }
 window.anatomyOcclusionCard=(host,card,answer=false)=>{host.hidden=!card?.occlusion;if(!card?.occlusion){host.replaceChildren();return}const diagram=diagrams.find(x=>x.id===card.occlusion.diagram);canvas(host,diagram,{target:card.occlusion.target,answer});};
 function update(){
  const scroll=$('oc-canvas'),oldLeft=scroll.scrollLeft||0,oldTop=scroll.scrollTop||0;
  const board=canvas($('oc-canvas'),selected,{interactive:true,onReveal:item=>{if(revealed.has(item.id)){revealed.delete(item.id);$('oc-last').textContent='התווית הוסתרה מחדש.'}else{revealed.add(item.id);$('oc-last').textContent=item.label}update()}});board.style.width=Math.max(640,Math.min(1100,selected.size[0]))*zoom+'px';scroll.scrollLeft=oldLeft;scroll.scrollTop=oldTop;
  $('oc-count').textContent=revealed.size+' מתוך '+selected.targets.length+' שמות נחשפו';$('oc-title').textContent=selected.title;$('oc-credit').textContent=data.media[selected.image].credit;$('oc-label-list').replaceChildren();
  selected.targets.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.textContent=revealed.has(item.id)?(i+1)+'. '+item.label:(i+1)+'. חשיפת השם';b.setAttribute('aria-pressed',String(revealed.has(item.id)));b.onclick=()=>{if(revealed.has(item.id)){revealed.delete(item.id);$('oc-last').textContent='התווית הוסתרה מחדש.'}else{revealed.add(item.id);$('oc-last').textContent=item.label}update()};$('oc-label-list').appendChild(b)});
 }
 for(const d of diagrams){const o=document.createElement('option');o.value=d.id;o.textContent=d.title;$('oc-diagram').appendChild(o)}
 $('oc-diagram').onchange=()=>{selected=diagrams.find(x=>x.id===$('oc-diagram').value);revealed=new Set();zoom=1;$('oc-last').textContent='נסי לזהות כל חלק לפי החץ לפני החשיפה.';update()};$('oc-hide-all').onclick=()=>{revealed.clear();$('oc-last').textContent='כל השמות הוסתרו. אפשר להתחיל שוב.';update()};$('oc-show-all').onclick=()=>{revealed=new Set(selected.targets.map(x=>x.id));$('oc-last').textContent='כל השמות גלויים; אפשר להסתיר שוב או ללחוץ על תווית מסוימת.';update()};$('oc-zoom-in').onclick=()=>{zoom=Math.min(2.5,zoom+.25);update()};$('oc-zoom-out').onclick=()=>{zoom=Math.max(.75,zoom-.25);update()};$('oc-source').onclick=()=>parent.postMessage({type:'notebook-open-section',lesson:selected.lesson,section:selected.section},'*');
 $('oc-total').textContent=diagrams.length+' תרשימים · '+diagrams.reduce((n,d)=>n+d.targets.length,0)+' תוויות. לחיצה על כיסוי חושפת את השם המקורי; התרגום מופיע מתחת ובכפתורים הממוספרים. אפשר ללחוץ שוב כדי להסתיר.';update();
})();
