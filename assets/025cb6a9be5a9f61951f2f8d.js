/* SPL Knee Atlas browser adaptation; source and complete Slicer license accompany the meshes. */
function createSPLKneeModel(data) {
 const group=new THREE.Group(),meshes=[];
 const box=new THREE.Box3();
 for(const rec of data.meshes){
  const decode=(s,C)=>{const b=Uint8Array.from(atob(s),c=>c.charCodeAt(0));return new C(b.buffer)};
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(decode(rec.positions64,Float32Array),3));g.setIndex(new THREE.BufferAttribute(decode(rec.indices64,Uint32Array),1));g.computeVertexNormals();g.computeBoundingBox();box.union(g.boundingBox);
  const mat=new THREE.MeshStandardMaterial({color:rec.color,roughness:.78,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(g,mat);mesh.userData.record=rec;meshes.push(mesh);group.add(mesh);
 }
 const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),scale=5.6/Math.max(size.x,size.y,size.z);
 group.position.copy(center).multiplyScalar(-scale);group.scale.setScalar(scale);
 const pivot=new THREE.Group();pivot.add(group);
 return {group:pivot,meshes,center,scale};
}
if(typeof document!=='undefined')(()=>{
 const host=document.getElementById('spl-knee-lab');if(!host)return;
 const modelData=JSON.parse(document.getElementById('spl-knee-data').textContent);
 const names={bone:'עצמות',ligament:'רצועות',meniscus:'מניסקוסים',cartilage:'סחוס מפרקי',fat:'כרית שומן',tendon:'גידים ו־IT tract',muscle:'שרירים',nerve:'עצבים',artery:'עורקים',vein:'ורידים'};
 const visible=new Set(['bone','ligament','meniscus','cartilage']);
 const stage=host.querySelector('.spl-stage'),list=host.querySelector('.spl-parts'),status=host.querySelector('.spl-status'),groups=host.querySelector('.spl-groups');
 let renderer,scene,camera,model,active=false,selected='',solo=false,quiz=false,drag=null,moved=false,yaw=0,pitch=0,distance=10.8;const revealed=new Set();
 const buttons=new Map();
 for(const [key,label]of Object.entries(names)){
  const lbl=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=visible.has(key);input.dataset.splGroup=key;
  input.onchange=()=>{input.checked?visible.add(key):visible.delete(key);if(!visible.has(modelData.meshes.find(r=>r.id===selected)?.group))selected='';solo=false;sync();draw()};
  lbl.append(input,document.createTextNode(label));groups.append(lbl);
 }
 modelData.meshes.forEach((rec,i)=>{const b=document.createElement('button');b.type='button';b.dataset.splPart=rec.id;b.style.setProperty('--part-color','#'+rec.color.toString(16).padStart(6,'0'));b.textContent=rec.label;b.onclick=()=>{selected=rec.id;revealed.add(rec.id);sync();draw()};buttons.set(rec.id,b);list.append(b)});
 function init(){
  if(renderer)return true;
  try{renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setClearColor(0x102331);stage.append(renderer.domElement);}
  catch(e){status.textContent='תלת־ממד אינו זמין בתצוגה הזו. פתחי את הקובץ ב־Safari או Chrome. רשימת המבנים זמינה למטה.';return false}
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.1,100);scene.add(new THREE.AmbientLight(0xffffff,1.25));
  for(const [x,y,z,power]of [[5,7,-8,1.5],[-6,2,6,.8]]){const l=new THREE.DirectionalLight(0xffffff,power);l.position.set(x,y,z);scene.add(l)}
  model=createSPLKneeModel(modelData);scene.add(model.group);sync();return true;
 }
 function sync(){
  let count=0;
  for(const [i,r]of modelData.meshes.entries()){
   const b=buttons.get(r.id);b.hidden=!visible.has(r.group);b.setAttribute('aria-pressed',String(selected===r.id));b.textContent=quiz&&!revealed.has(r.id)?'מבנה '+(i+1)+' · לחצי לחשיפה':r.label;if(!b.hidden)count++;
  }
  host.querySelector('[data-spl-solo]').setAttribute('aria-pressed',String(solo));host.querySelector('[data-spl-quiz]').setAttribute('aria-pressed',String(quiz));
  if(model)for(const m of model.meshes){const r=m.userData.record;m.visible=visible.has(r.group)&&(!solo||r.id===selected);const pick=r.id===selected;m.material.emissive.setHex(pick?0x6b4c09:0);m.material.color.setHex(pick?0xffd166:r.color);m.material.opacity=r.group==='bone'&&!pick?.22:1;m.material.transparent=m.material.opacity<1;m.material.depthWrite=!m.material.transparent;m.renderOrder=m.material.transparent?2:0;}
  const r=modelData.meshes.find(r=>r.id===selected);status.textContent=r?r.label+(solo?' · המבנה מוצג לבדו':' · מודגש בצהוב'):(quiz?'בחרי מבנה בדגם או ברשימה כדי לחשוף את שמו.':'בחרי מבנה בדגם או ברשימה. העצמות שקופות כדי לחשוף את המבנים שבתוכן.');
  host.querySelector('.spl-count').textContent=count+' מתוך '+modelData.meshes.length+' מבנים ברשימה';
 }
 function draw(){if(!active||!init())return;const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.set(0,0,-distance);camera.lookAt(0,0,0);camera.updateProjectionMatrix();model.group.rotation.set(pitch,yaw,0);renderer.render(scene,camera)}
 function view(x,y){pitch=x;yaw=y;draw()}
 host.querySelector('[data-spl-front]').onclick=()=>view(0,0);host.querySelector('[data-spl-back]').onclick=()=>view(0,Math.PI);host.querySelector('[data-spl-side]').onclick=()=>view(0,Math.PI/2);host.querySelector('[data-spl-top]').onclick=()=>view(Math.PI/2,0);
 host.querySelector('[data-spl-reset]').onclick=()=>{selected='';solo=false;distance=10.8;view(0,0);sync();draw()};
 host.querySelector('[data-spl-solo]').onclick=()=>{if(!selected){status.textContent='בחרי תחילה מבנה בדגם או ברשימה.';return}solo=!solo;sync();draw()};
 host.querySelector('[data-spl-quiz]').onclick=()=>{quiz=!quiz;revealed.clear();selected='';solo=false;sync();draw()};host.querySelector('[data-spl-hide]').onclick=()=>{quiz=true;revealed.clear();selected='';solo=false;sync();draw()};
 host.querySelectorAll('[data-spl-zoom]').forEach(b=>b.onclick=()=>{distance=Math.max(6,Math.min(18,distance+(b.dataset.splZoom==='in'?-1:1)));draw()});
 stage.onpointerdown=e=>{drag=[e.clientX,e.clientY];moved=false;stage.setPointerCapture(e.pointerId)};
 stage.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag[0],dy=e.clientY-drag[1];if(Math.abs(dx)+Math.abs(dy)>2)moved=true;yaw-=dx*.009;pitch=Math.max(-1.55,Math.min(1.55,pitch+dy*.009));drag=[e.clientX,e.clientY];draw()};
 stage.onpointerup=e=>{drag=null;if(moved||!model)return;const rect=stage.getBoundingClientRect(),p=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(p,camera);const hits=ray.intersectObjects(model.meshes.filter(m=>m.visible));const hit=hits.find(h=>h.object.userData.record.group!=='bone')||hits[0];if(hit){selected=hit.object.userData.record.id;revealed.add(selected);sync();draw()}};
 stage.onpointercancel=()=>drag=null;stage.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.2;if(e.key==='ArrowRight')yaw+=.2;if(e.key==='ArrowUp')pitch-=.2;if(e.key==='ArrowDown')pitch+=.2;draw()};
 new ResizeObserver(draw).observe(stage);new IntersectionObserver(es=>{active=es[0].isIntersecting;if(active)draw()},{rootMargin:'150px'}).observe(stage);
 window.addEventListener('pagehide',()=>{model?.meshes.forEach(m=>{m.geometry.dispose();m.material.dispose()});renderer?.dispose()},{once:true});sync();
})();
