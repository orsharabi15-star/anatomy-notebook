const CT_TERMS={matrix:'מטריצה חוץ־תאית — Extracellular matrix (ECM)',ground:'חומר בסיס — Ground substance',collagen:'סיבי קולגן — Collagen fibers',elastic:'סיבים אלסטיים — Elastic fibers',reticular:'סיבים רטיקולריים — Reticular fibers',cell:'פיברובלסט — Fibroblast',lamella:'למלות — Lamellae',canal:'תעלה מרכזית — Haversian canal',canaliculi:'תעלות זעירות — Canaliculi',osteocyte:'אוסטאוציט — Osteocyte',chondrocyte:'תא סחוס — Chondrocyte',lacuna:'לקונה — Lacuna',intima:'השכבה הפנימית — Tunica intima',media:'השכבה האמצעית — Tunica media',adventitia:'השכבה החיצונית — Tunica adventitia (externa)'};
const CT_MODES={matrix:[['all','כל המרכיבים'],['cell',CT_TERMS.cell],['collagen',CT_TERMS.collagen],['elastic',CT_TERMS.elastic],['reticular',CT_TERMS.reticular],['ground',CT_TERMS.ground]],fibers:[['areolar','רקמת חיבור אוורירית — Areolar connective tissue'],['regular','רקמת חיבור צפופה סדירה — Dense regular connective tissue'],['irregular','רקמת חיבור צפופה לא סדירה — Dense irregular connective tissue'],['reticular','רקמת חיבור רטיקולרית — Reticular connective tissue']],osteon:[['all','אוסטאון (מערכת האוורס) — Osteon (Haversian system)'],['lamella',CT_TERMS.lamella],['canal',CT_TERMS.canal],['osteocyte',CT_TERMS.osteocyte],['canaliculi',CT_TERMS.canaliculi]],cartilage:[['hyaline','סחוס היאליני — Hyaline cartilage'],['fibro','סחוס סיבי — Fibrocartilage'],['elastic','סחוס אלסטי — Elastic cartilage']],vessels:[['artery','עורק — Artery'],['vein','וריד — Vein'],['capillary','נים — Capillary']],lymph:[['all','מסלול החזרה לדם'],['tissue','נוזל בין־רקמתי — Interstitial fluid'],['capillary','נים לימפה — Lymphatic capillary'],['node','קשר לימפה — Lymph node'],['blood','החזרה לדם הוורידי — Venous return']]};
function buildCTModel(type,mode){
 const group=new THREE.Group();const labels=[];const palette={cell:0xc388e6,collagen:0xefb86a,elastic:0x67c7b2,ground:0x5c9bd1,reticular:0xaac76a,lamella:0xe6c38b,canal:0xe76b73,canaliculi:0xeed8a4,osteocyte:0xb28bda,chondrocyte:0xb286db,lacuna:0xd1e8f0,intima:0xe8ad9c,media:0xd77c86,adventitia:0xceb57a};
 function mat(key,opacity=1){return new THREE.MeshStandardMaterial({color:palette[key]??0xaac76a,roughness:.68,side:THREE.DoubleSide,transparent:opacity<1,opacity})}
 function mesh(geometry,key,pos=[0,0,0],opacity=1){const m=new THREE.Mesh(geometry,mat(key,opacity));m.position.set(...pos);m.userData.term=key;group.add(m);return m}
 function ball(key,pos,size=.13,scale){const m=mesh(new THREE.SphereGeometry(size,16,12),key,pos);if(scale)m.scale.set(...scale);return m}
 function line(key,a,b,r=.05){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),diff=to.clone().sub(from);const m=mesh(new THREE.CylinderGeometry(r,r,diff.length(),12),key,from.clone().add(to).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());return m}
 function fiber(key,points,r=.045){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,24,r,7,false),key)}
 function tag(key,label=CT_TERMS[key]){if(!labels.some(x=>x.key===key))labels.push({key,label,color:palette[key]??0xaac76a})}
 let caption='';
 if(type==='matrix'||type==='fibers'){
  mesh(new THREE.BoxGeometry(5,3.3,2.4),'ground',[0,0,0],.09);tag('ground');
  const arrangement=type==='matrix'?'areolar':mode,count=arrangement==='regular'||arrangement==='irregular'?18:8;
  for(let i=0;i<count;i++){
   const a=i*.71,b=i*1.17;
   if(arrangement==='regular')fiber('collagen',[[-2.4,-1.35+i*.16,-.7+(i%4)*.45],[0,-1.3+i*.16,-.65+(i%4)*.45],[2.4,-1.35+i*.16,-.7+(i%4)*.45]],.075);
   else if(arrangement==='reticular'){
    const x=-2.2+(i%4)*1.45,y=-1.2+Math.floor(i/4)*2.4;
    fiber('reticular',[[x,y,-.5],[x+.4,0,.1],[x+.8,-y,.5]],.045);fiber('reticular',[[x+.4,0,.1],[x+1.3,.45,-.4]],.045);
   }else fiber('collagen',[[-2.3,Math.sin(a)*1.35,Math.cos(b)],[0,Math.sin(b)*1.15,Math.cos(a)*.7],[2.3,Math.cos(a)*1.35,Math.sin(b)]],arrangement==='irregular'?.09:.065);
  }
  if(arrangement!=='reticular')tag('collagen');else tag('reticular');
  if(arrangement==='areolar')for(let i=0;i<5;i++)fiber('elastic',[[-2,1.3-i*.6,.4],[0,.9-i*.4,-.6],[2,-1.1+i*.5,.6]],.025);
  if(arrangement==='areolar')tag('elastic');
  if(type==='matrix'){for(let i=0;i<3;i++){fiber('reticular',[[-1.8+i*.9,1.2,-.8],[0,0,-.4],[1.8-i*.7,-1.1,.3]],.023)}tag('reticular');}
  for(let i=0;i<5;i++){const x=-1.8+i*.85,y=Math.sin(i*1.6)*.9;ball('cell',[x,y,.8],.18,[1.5,.5,.8])}tag('cell');
  caption=arrangement==='regular'?'סיבים מקבילים מסייעים להתנגד למתיחה בעיקר בכיוון האורך. הצפיפות והמרווחים כאן סכמטיים.':arrangement==='irregular'?'אלומות בכיוונים שונים תומכות בהתנגדות למתיחה מכמה כיוונים.':arrangement==='reticular'?'רשת סיבים דקה יוצרת שלד תמיכה לתאים. אין לבלבל בין רקמה רטיקולרית לבין השכבה הרטיקולרית של הדרמיס.':'התאים נמצאים בתוך סביבה חוץ־תאית. ECM כולל סיבים וחומר בסיס; התאים עצמם אינם חלק מה־ECM.';
  if(type==='matrix'&&mode!=='all')group.traverse(m=>{if(m.isMesh&&m.userData.term!==mode){m.material.transparent=true;m.material.opacity=.08;m.material.depthWrite=false}});
 }else if(type==='osteon'){
  for(let i=0;i<5;i++){const radius=.65+i*.32;mesh(new THREE.CylinderGeometry(radius,radius,3,56,1,true,.3,Math.PI*1.65),'lamella',[0,0,0],.32)}tag('lamella');
  mesh(new THREE.CylinderGeometry(.23,.23,3.5,24),'canal');tag('canal');
  for(let j=0;j<3;j++)for(let i=0;i<8;i++){const a=i*Math.PI/4+.4,r=.8+(j%2)*.7,y=-.9+j*.9;const p=[Math.cos(a)*r,y,Math.sin(a)*r];ball('osteocyte',p,.1,[1,.6,1]);for(let k=-1;k<=1;k++)line('canaliculi',p,[Math.cos(a+k*.12)*(r+.3),y+.18,Math.sin(a+k*.12)*(r+.3)],.012)}tag('osteocyte');tag('canaliculi');
  if(mode!=='all')group.traverse(m=>{if(m.isMesh&&m.userData.term!==mode){m.material.transparent=true;m.material.opacity=.06;m.material.depthWrite=false}});
  caption='חתך סכמטי באוסטאון של עצם צפופה. הלמלות מקיפות תעלה מרכזית; התאים שוכנים בלקונות ומתקשרים דרך תעלות זעירות. הלקונות אינן מצוירות בנפרד. קנה המידה של התאים והתעלות מוגדל להמחשה; כלי הדם עצמם אינם מפורטים.';
 }else if(type==='cartilage'){
  mesh(new THREE.BoxGeometry(4.8,3,2.2),'ground',[0,0,0],.13);tag('ground');
  for(let i=0;i<10;i++){const p=[-1.85+(i%5)*.9,-.7+Math.floor(i/5)*1.4,Math.sin(i*2)*.6];const shell=ball('lacuna',p,.29);shell.material.transparent=true;shell.material.opacity=.22;shell.material.depthWrite=false;ball('chondrocyte',p,.16)}tag('lacuna');tag('chondrocyte');
  if(mode==='fibro')for(let i=0;i<10;i++)fiber('collagen',[[-2.25,-1.25+i*.27,-.6],[0,-1.15+i*.27,.1],[2.25,-1.25+i*.27,-.3]],.08);
  if(mode==='elastic')for(let i=0;i<10;i++)fiber('elastic',[[-2.2,Math.sin(i)*1.3,-.6],[0,Math.cos(i)*1.1,.7],[2.2,Math.sin(i+1)*1.3,-.5]],.045);
  if(mode==='fibro')tag('collagen');if(mode==='elastic')tag('elastic');
  caption=mode==='hyaline'?'סחוס היאליני: מראה מטריצה אחיד יחסית; סיבי קולגן מסוג II קיימים אך בדרך כלל אינם מובחנים כסיבים נפרדים בצביעה שגרתית. זו המחשה סכמטית, לא פרפרט.':mode==='fibro'?'סחוס סיבי: אלומות קולגן בולטות ותאי סחוס ביניהן. הסידור במודל מפושט; דוגמאות הן מניסקוס והטבעת הסיבית של דיסק בין־חולייתי.':'סחוס אלסטי: רשת סיבים אלסטיים בנוסף למרכיבי הסחוס, המאפשרת חזרה לצורה. דוגמה: אפרכסת האוזן, למעט התנוך.';
 }else if(type==='vessels'){
  if(mode==='capillary'){mesh(new THREE.CylinderGeometry(.8,.8,4,36,1,true,.3,5.5),'intima');tag('intima','אנדותל — Endothelium');caption='נים בנוי בעיקר משכבת אנדותל ומקרום בסיס. אין בו שלוש שכבות דופן מפותחות כמו בעורק או בווריד.'}
  else{const vein=mode==='vein',inner=vein?1.2:.7;for(const [radius,key,opacity]of [[inner,'intima',.9],[inner+(vein?.13:.48),'media',.5],[inner+(vein?.4:.7),'adventitia',.3]]){mesh(new THREE.CylinderGeometry(radius,radius,3.6,48,1,true,.3,5.1),key,[0,0,0],opacity);tag(key)}caption=vein?'וריד: בדגם לומן רחב יותר ושכבת שריר דקה יחסית. ההבדלים משתנים בין כלי דם; גודל הדגם אינו מדידה אנטומית.':'עורק: בדגם שכבה אמצעית עבה יחסית. השכבה החיצונית מכילה רקמת חיבור. גודל הדגם אינו מדידה אנטומית.'}
  for(let i=0;i<6;i++)ball('canal',[Math.sin(i)*.35,-1.4+i*.5,Math.cos(i)*.3],.13,[1,.5,1]);
 }else if(type==='lymph'){
  const segments=[{key:'tissue',name:'נוזל בין־רקמתי — Interstitial fluid',a:[-2.6,-1.1,0],b:[-1.5,-.4,0]},{key:'capillary',name:'נים לימפה — Lymphatic capillary',a:[-1.5,-.4,0],b:[-.4,0,0]},{key:'node',name:'קשר לימפה — Lymph node',a:[-.4,0,0],b:[.5,0,0]},{key:'blood',name:'החזרה לדם הוורידי — Venous return',a:[.5,0,0],b:[2.6,1.1,0]}];
  for(const part of segments){palette[part.key]=part.key==='blood'?0x75a8e0:0x80c99c;line(part.key,part.a,part.b,.13);if(part.key==='node')ball(part.key,[0,0,0],.42,[1.2,.8,.8]);tag(part.key,part.name);const direction=new THREE.Vector3(...part.b).sub(new THREE.Vector3(...part.a));const arrow=new THREE.ArrowHelper(direction.clone().normalize(),new THREE.Vector3(...part.a).lerp(new THREE.Vector3(...part.b),.48),.45,0xf0ce75,.18,.12);arrow.traverse(o=>o.userData.term=part.key);group.add(arrow)}
  if(mode!=='all')group.traverse(m=>{if(m.isMesh&&m.userData.term&&m.userData.term!==mode){m.material.transparent=true;m.material.opacity=.1}});
  caption='מסלול עקרוני: נוזל נכנס לנימי הלימפה, עובר בכלי לימפה ובקשרים וחוזר למחזור הדם הוורידי. המרחקים והצורה כאן סכמטיים; זה אינו מסלול כלי מסוים בגוף.';
 }
 return {group,labels,caption};
}
function initCTDemo(host){
 const type=host.dataset.ctDemo,choices=CT_MODES[type];host.classList.add('lab');host.innerHTML='<div class="lab-heading"><b>לראות את המבנה במרחב</b><span>המחשה תלת־ממדית סכמטית</span></div><div class="stage" tabindex="0" role="img" aria-label="המחשת רקמת חיבור בתלת־ממד"></div><div class="controls"><button data-ct-reset>איפוס מבט</button><button data-ct-zoom="in">＋</button><button data-ct-zoom="out">−</button></div><div class="options ct-modes"></div><div class="ct-legend"></div><p class="lab-info" aria-live="polite"></p><p class="sub">גררי לסיבוב. הצבעים וקנה המידה נועדו להסבר ואינם מייצגים צביעה מיקרוסקופית.</p>';
 const stage=host.querySelector('.stage'),info=host.querySelector('.lab-info'),legend=host.querySelector('.ct-legend'),options=host.querySelector('.ct-modes');let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true})}catch{info.textContent='התלת־ממד אינו זמין בתצוגה זו. הסיכום והעריכה זמינים; לפתיחת ההמחשות השתמשי בדפדפן התומך ב־WebGL.';return}
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x0e1a2e);scene.add(new THREE.AmbientLight(0xffffff,.9));const light=new THREE.DirectionalLight(0xffffff,1.1);light.position.set(3,5,7);scene.add(light);const camera=new THREE.PerspectiveCamera(40,1,.1,100);let model,angleX=.15,angleY=.25,distance=11,drag=null,visible=true;
 function display(key){if(model){scene.remove(model.group);model.group.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()})}model=buildCTModel(type,key);scene.add(model.group);info.textContent=model.caption;legend.replaceChildren();for(const item of model.labels){const chip=document.createElement('span');chip.textContent=item.label;chip.style.setProperty('--c','#'+item.color.toString(16).padStart(6,'0'));legend.appendChild(chip)}options.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===key)));draw()}
 for(const [key,label]of choices){const b=document.createElement('button');b.textContent=label;b.dataset.value=key;b.onclick=()=>display(key);options.appendChild(b)}
 function draw(){if(!model||!visible)return;model.group.rotation.set(angleX,angleY,0);camera.position.z=distance;renderer.render(scene,camera)}
 function resize(){const w=stage.clientWidth||600,h=stage.clientHeight||380;renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();draw()}
 stage.appendChild(renderer.domElement);new ResizeObserver(resize).observe(stage);new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)draw()}).observe(host);stage.onpointerdown=e=>{drag=[e.clientX,e.clientY];stage.setPointerCapture(e.pointerId)};stage.onpointermove=e=>{if(drag){angleY+=(e.clientX-drag[0])*.01;angleX+=(e.clientY-drag[1])*.01;drag=[e.clientX,e.clientY];draw()}};stage.onpointerup=stage.onpointercancel=()=>drag=null;stage.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')angleY-=.2;if(e.key==='ArrowRight')angleY+=.2;if(e.key==='ArrowUp')angleX-=.2;if(e.key==='ArrowDown')angleX+=.2;draw()}};
 host.querySelector('[data-ct-reset]').onclick=()=>{angleX=.15;angleY=.25;distance=11;draw()};host.querySelectorAll('[data-ct-zoom]').forEach(b=>b.onclick=()=>{distance=Math.max(7,Math.min(18,distance+(b.dataset.ctZoom==='in'?-.8:.8)));draw()});display(choices[0][0]);resize();
}
if(typeof document!=='undefined')document.querySelectorAll('[data-ct-demo]').forEach(initCTDemo);
