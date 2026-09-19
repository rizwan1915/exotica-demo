import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const variants={noir:['NOIR SULTANA',0x210710],oud:['OUD ROYALE',0x32130d],rose:['ROSE SULTANA',0x70172e],amber:['AMBER D&apos;OR',0x743414]};
const motion=matchMedia('(prefers-reduced-motion: reduce)');

function labelTexture(name){
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=720;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#efdfbc';ctx.fillRect(0,0,640,720);
  ctx.strokeStyle='#a88950';ctx.lineWidth=4;ctx.strokeRect(20,20,600,680);ctx.lineWidth=1;ctx.strokeRect(31,31,578,658);
  ctx.textAlign='center';ctx.fillStyle='#431625';
  ctx.font='24px Georgia';ctx.fillText('HOUSE OF VIVIAN',320,146);
  ctx.font='76px Georgia';ctx.fillText('EXOTICA',320,267);
  ctx.strokeStyle='#ad8852';ctx.beginPath();ctx.moveTo(105,316);ctx.lineTo(535,316);ctx.stroke();
  ctx.font='35px Georgia';ctx.fillText(name,320,414);
  ctx.font='18px Georgia';ctx.fillText('EAU DE PARFUM',320,536);ctx.fillText('100 ML  /  3.4 FL. OZ.',320,586);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

function mount(host){
  const [name,color]=variants[host.dataset.bottle]||variants.noir;
  let renderer;
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.1,50);
    const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
    const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.9;
    room.dispose();pmrem.dispose();
    const group=new THREE.Group();scene.add(group);
    const gold=new THREE.MeshStandardMaterial({color:0xd9b56b,metalness:1,roughness:.22});
    const glass=new THREE.MeshPhysicalMaterial({color:0xfff3df,metalness:0,roughness:.08,transmission:1,thickness:.24,ior:1.45,clearcoat:1});
    const liquid=new THREE.MeshPhysicalMaterial({color,roughness:.2,metalness:.05,clearcoat:1});
    function box(w,h,d,r,mat,x,y,z){
      const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,4,r),mat);mesh.position.set(x,y,z);mesh.castShadow=mat!==glass;group.add(mesh);return mesh;
    }
    box(1.44,1.97,.8,.13,glass,0,1.21,0);
    box(1.21,1.60,.57,.10,liquid,0,1.20,0);
    box(1.42,.045,.77,.02,gold,0,.245,0);
    box(1.35,.035,.70,.016,gold,0,2.17,0);
    const collar=new THREE.Mesh(new THREE.CylinderGeometry(.22,.25,.17,40),gold);collar.position.y=2.26;collar.castShadow=true;group.add(collar);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.49,64),gold);cap.position.y=2.55;cap.castShadow=true;group.add(cap);
    const ribGeometry=new THREE.BoxGeometry(.018,.44,.026),ribMatrix=new THREE.Object3D();
    const ribs=new THREE.InstancedMesh(ribGeometry,gold,40);
    for(let i=0;i<40;i++){const angle=i/40*Math.PI*2;ribMatrix.position.set(Math.sin(angle)*.337,2.55,Math.cos(angle)*.337);ribMatrix.rotation.y=angle;ribMatrix.updateMatrix();ribs.setMatrixAt(i,ribMatrix.matrix)}
    ribs.castShadow=true;group.add(ribs);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(.32,.34,.04,64),gold);top.position.y=2.815;group.add(top);
    const label=new THREE.Mesh(new THREE.PlaneGeometry(.96,1.08),new THREE.MeshStandardMaterial({map:labelTexture(name),roughness:.68}));label.position.set(0,1.19,.407);group.add(label);
    const plinth=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.26,.18,64),new THREE.MeshStandardMaterial({color:0x231016,roughness:.7,metalness:.18}));plinth.position.y=.095;plinth.receiveShadow=true;scene.add(plinth);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.20,.008,8,80),gold);ring.rotation.x=Math.PI/2;ring.position.y=.187;scene.add(ring);
    const key=new THREE.SpotLight(0xffedcb,65,20,.5,.7,2);key.position.set(-3,6,4);key.target.position.set(0,1,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0003;scene.add(key,key.target);
    const rim=new THREE.DirectionalLight(0xffd7ac,2.2);rim.position.set(3,3,-2);scene.add(rim);
    const fill=new THREE.DirectionalLight(0xffe4db,1.4);fill.position.set(-3,2,3);scene.add(fill);
    group.rotation.y=-.30;
    const canvas=renderer.domElement;
    canvas.setAttribute('role','img');canvas.setAttribute('aria-label',name+' interactive 3D concept bottle. Use left and right arrow keys to rotate.');canvas.tabIndex=0;
    canvas.style.touchAction='pan-y';canvas.style.cursor='grab';
    host.appendChild(canvas);
    let visible=true,frame=0,drag=null,failed=false;
    function render(){frame=0;if(visible&&!failed){try{renderer.render(scene,camera)}catch(error){fail(error)}}}
    function requestRender(){if(!frame&&!failed)frame=requestAnimationFrame(render)}
    function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.set(0,2.85,Math.max(6.4,5.4/camera.aspect));camera.lookAt(0,1.42,0);camera.updateProjectionMatrix();requestRender()}
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
    const visibilityObserver=new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;if(visible)requestRender()});visibilityObserver.observe(host);
    function fail(error){if(failed)return;failed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();visibilityObserver.disconnect();host.classList.remove('model-ready');canvas.remove();renderer.dispose();console.warn('3D preview unavailable; showing the bottle illustration.',error)}
    canvas.addEventListener('webglcontextlost',function(e){e.preventDefault();fail('WebGL context lost')});
    canvas.addEventListener('pointerdown',function(e){if(e.pointerType==='touch'||e.button!==0)return;drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing'});
    canvas.addEventListener('pointermove',function(e){if(!drag)return;group.rotation.y+=(e.clientX-drag.x)*.008;if(!motion.matches)group.rotation.x=THREE.MathUtils.clamp(group.rotation.x+(e.clientY-drag.y)*.003,-.15,.15);drag={x:e.clientX,y:e.clientY};requestRender()});
    function release(){drag=null;canvas.style.cursor='grab'}
    canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
    canvas.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();group.rotation.y+=e.key==='ArrowLeft'?-.18:.18;requestRender()}if(e.key==='Home'){e.preventDefault();group.rotation.set(0,-.30,0);requestRender()}});
    const controls=document.createElement('div');controls.className='model-controls';
    [['Rotate left',-.25,'\u2190'],['Rotate right',.25,'\u2192']].forEach(function([label,amount,text]){const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',label+' '+name);button.textContent=text;button.addEventListener('click',function(){group.rotation.y+=amount;requestRender()});controls.appendChild(button)});
    host.appendChild(controls);
    resize();renderer.render(scene,camera);host.classList.add('model-ready');
  }catch(error){renderer?.dispose();host.querySelector('canvas')?.remove();console.warn('3D preview unavailable; showing the bottle illustration.',error)}
}

const observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){observer.unobserve(entry.target);mount(entry.target)}})},{rootMargin:'150px'});
document.querySelectorAll('[data-bottle]').forEach(function(host){observer.observe(host)});
