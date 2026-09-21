/* Lightweight low-poly AR diorama placed over the phone's live camera. */
(function(){
  const wait=()=>window.THREE?start():setTimeout(wait,80);
  function start(){
    const btn=document.querySelector('#enableCamera'); if(!btn)return;
    if(!document.querySelector('#arCanvas')){const c=document.createElement('canvas');c.id='arCanvas';c.setAttribute('aria-label','Interactive 3D floating seaside world');document.querySelector('#experience').append(c)}
    const original=btn.onclick;
    btn.onclick=async function(){
      try{
        const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
        document.querySelector('#camera').srcObject=stream;
        document.querySelector('#cameraPrompt').classList.remove('show');
        document.querySelector('#experience').classList.add('camera-live','ar-3d');
        build();
      }catch(e){ original && original.call(this); }
    };
  }
  let built=false;
  function build(){if(built)return;built=true;
    const T=window.THREE, canvas=document.querySelector('#arCanvas'), host=document.querySelector('#experience');
    const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);
    const scene=new T.Scene(), camera=new T.PerspectiveCamera(36,1,.1,100);camera.position.set(0,5.7,11);camera.lookAt(0,0,0);
    scene.add(new T.HemisphereLight(0xfff1c5,0x0a5d69,2.6));const key=new T.DirectionalLight(0xffdd9c,3);key.position.set(-6,10,6);scene.add(key);
    const root=new T.Group();root.rotation.x=-.08;root.scale.setScalar(.84);scene.add(root);
    const mat=(color,rough=.75)=>new T.MeshStandardMaterial({color,roughness:rough,flatShading:true});
    const cyl=(r1,r2,h,color,x,y,z,segments=16)=>{const o=new T.Mesh(new T.CylinderGeometry(r1,r2,h,segments),mat(color));o.position.set(x,y,z);root.add(o);return o};
    const sphere=(r,color,x,y,z)=>{const o=new T.Mesh(new T.SphereGeometry(r,12,8),mat(color));o.position.set(x,y,z);root.add(o);return o};
    // Ocean platter: two stacked cylinders read as a floating 3D island.
    cyl(4.9,5.2,.56,0x1d91b8,0,-1.36,0,48);cyl(4.72,4.86,.20,0xf1bd75,0,-.98,0,48);cyl(4.55,4.63,.15,0x2fa765,0,-.80,0,48);
    const island=new T.Group();root.add(island);island.position.set(.45,-.64,.15);
    const rock=(x,z,s)=>{const r=new T.Mesh(new T.DodecahedronGeometry(s,0),mat(0x4e5b50));r.position.set(x,s*.48,z);island.add(r)};rock(-2,-.6,.42);rock(1.65,.78,.38);rock(2.28,-1.1,.3);rock(.5,.9,.28);
    // Lighthouse with tapered white/red tower, cap and glowing lantern.
    const tower=new T.Group();island.add(tower);tower.position.set(1.65,.03,-.5);
    cyl(.36,.52,1.95,0xfff5d9,0,1,0,12).removeFromParent();
    const body=new T.Mesh(new T.CylinderGeometry(.36,.52,1.95,12),mat(0xfff4da));body.position.y=1; tower.add(body);
    [0.55,1.15].forEach(y=>{const stripe=new T.Mesh(new T.CylinderGeometry(.405,.47,.23,12),mat(0xed705b));stripe.position.y=y;tower.add(stripe)});
    const roof=new T.Mesh(new T.ConeGeometry(.62,.42,8),mat(0x174d68));roof.position.y=2.23;tower.add(roof);const lamp=sphere(.21,0xffe982,0,1.98,0);lamp.removeFromParent();tower.add(lamp);
    // Palm trees
    function palm(x,z,scale){const p=new T.Group();p.position.set(x,0,z);p.scale.setScalar(scale);island.add(p);const trunk=new T.Mesh(new T.CylinderGeometry(.105,.19,1.65,8),mat(0x87552e));trunk.position.y=.82;trunk.rotation.z=.12;p.add(trunk);for(let i=0;i<9;i++){const leaf=new T.Mesh(new T.ConeGeometry(.11,1.38,3),mat(i%2?0x3e8f35:0x64ae3f));leaf.position.y=1.62;leaf.rotation.z=Math.PI/2+.24;leaf.rotation.y=i*Math.PI*2/9;leaf.position.x=Math.cos(i*Math.PI*2/9)*.51;leaf.position.z=Math.sin(i*Math.PI*2/9)*.51;leaf.scale.set(1,.55,1);p.add(leaf)}}palm(-2.3,.1,1.1);palm(2.15,.7,.86);
    // A cheerful 3D sun floating just behind the island.
    const sun=new T.Group();sun.position.set(-2.85,3.05,-1.9);root.add(sun);const sunCore=new T.Mesh(new T.SphereGeometry(.55,16,12),new T.MeshStandardMaterial({color:0xffd35a,emissive:0xff9e24,emissiveIntensity:.65,flatShading:true}));sun.add(sunCore);const sunGlow=new T.PointLight(0xffb34a,2.2,8);sun.add(sunGlow);for(let i=0;i<12;i++){const ray=new T.Mesh(new T.ConeGeometry(.065,.42,4),mat(0xffc84d));ray.position.set(Math.cos(i*Math.PI/6)*.82,Math.sin(i*Math.PI/6)*.82,0);ray.rotation.z=-i*Math.PI/6+Math.PI/2;sun.add(ray)}
    // A tiny keeper gives the island a character and scale.
    const keeper=new T.Group();keeper.position.set(-.85,.04,-.78);island.add(keeper);
    const body=new T.Mesh(new T.ConeGeometry(.26,.7,7),mat(0x276b94));body.position.y=.38;keeper.add(body);
    const head=new T.Mesh(new T.SphereGeometry(.23,10,8),mat(0xf3b377));head.position.y=.89;keeper.add(head);
    const cap=new T.Mesh(new T.CylinderGeometry(.24,.24,.12,10),mat(0xe75e4e));cap.position.y=1.08;keeper.add(cap);
    const brim=new T.Mesh(new T.BoxGeometry(.34,.05,.12),mat(0xe75e4e));brim.position.set(0,1.04,.18);keeper.add(brim);
    const arm=new T.Mesh(new T.CylinderGeometry(.045,.055,.48,6),mat(0x276b94));arm.position.set(.25,.55,.02);arm.rotation.z=-.75;keeper.add(arm);
    // Treasure, flowers, coral, and a painted harbor buoy.
    const chest=new T.Group();chest.position.set(2.15,.02,-.15);island.add(chest);const base=new T.Mesh(new T.BoxGeometry(.58,.3,.38),mat(0x7a4123));base.position.y=.18;chest.add(base);const lid=new T.Mesh(new T.CylinderGeometry(.205,.205,.58,10,1,false,0,Math.PI),mat(0xbf7130));lid.rotation.z=Math.PI/2;lid.position.y=.37;chest.add(lid);const lock=new T.Mesh(new T.BoxGeometry(.1,.12,.03),mat(0xffd869));lock.position.set(0,.2,.21);chest.add(lock);
    for(let i=0;i<8;i++){const flower=new T.Mesh(new T.SphereGeometry(.075,7,6),mat(i%2?0xff7d87:0xffdb61));flower.position.set(-2.8+(i%4)*.23,.1,1.18+Math.floor(i/4)*.23);island.add(flower)}
    for(let i=0;i<4;i++){const coral=new T.Mesh(new T.ConeGeometry(.08,.55,6),mat(i%2?0xff816c:0xf4c34d));coral.position.set(.15+i*.16,.27,1.15+(i%2)*.12);coral.rotation.z=(i-1.5)*.22;island.add(coral)}
    const buoy=new T.Group();buoy.position.set(-3.7,-.61,1.15);root.add(buoy);const floaty=new T.Mesh(new T.CylinderGeometry(.18,.22,.64,10),mat(0xff7358));floaty.position.y=.3;buoy.add(floaty);const top=new T.Mesh(new T.SphereGeometry(.12,8,6),mat(0xffeea8));top.position.y=.68;buoy.add(top);
    // Orbiting sea sparkles and a stylized gull above the island.
    const sparkles=[];for(let i=0;i<18;i++){const s=new T.Mesh(new T.OctahedronGeometry(.035),new T.MeshBasicMaterial({color:i%2?0xb5fff6:0xffefaa}));s.position.set((Math.random()-.5)*8,-.59+Math.random()*.08,(Math.random()-.5)*6);root.add(s);sparkles.push(s)}
    const gull=new T.Group();gull.position.set(-1.9,2.5,-.6);root.add(gull);for(const side of[-1,1]){const wing=new T.Mesh(new T.ConeGeometry(.14,.78,3),mat(0xfff7dd));wing.rotation.z=side*1.18;wing.rotation.y=.18;wing.position.x=side*.33;gull.add(wing)}const gullBody=new T.Mesh(new T.SphereGeometry(.13,8,6),mat(0xfff7dd));gull.add(gullBody);
    // Little boat at the front and a glowing navigation crystal.
    const boat=new T.Group();root.add(boat);boat.position.set(-1.7,-.55,2.2);const hull=new T.Mesh(new T.CylinderGeometry(.35,.65,.5,4),mat(0xf27652));hull.scale.z=1.45;hull.rotation.y=Math.PI/4;boat.add(hull);const mast=new T.Mesh(new T.CylinderGeometry(.045,.045,1.25,8),mat(0x754229));mast.position.y=.65;boat.add(mast);const sail=new T.Mesh(new T.ConeGeometry(.54,.88,3),mat(0xfff0ca));sail.rotation.z=-Math.PI/2;sail.position.set(.35,.9,0);boat.add(sail);
    const gem=new T.Mesh(new T.OctahedronGeometry(.38),new T.MeshStandardMaterial({color:0x3ef8e1,emissive:0x14bfc3,emissiveIntensity:1.1,flatShading:true}));gem.position.set(-.25,.2,-.1);island.add(gem);const glow=new T.PointLight(0x38ffe5,3,5);glow.position.copy(gem.position);island.add(glow);
    let px=0,py=0,desiredScale=.84,pinchDistance=0,dragY=0;
    addEventListener('deviceorientation',e=>{px=(e.gamma||0)*.018;py=(e.beta||0)*.008});
    addEventListener('pointermove',e=>{px=(e.clientX/innerWidth-.5)*.28;py=(e.clientY/innerHeight-.5)*.12});
    canvas.style.touchAction='none';
    const distance=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
    canvas.addEventListener('touchstart',e=>{if(e.touches.length===2)pinchDistance=distance(e.touches);else dragY=e.touches[0].clientY},{passive:true});
    canvas.addEventListener('touchmove',e=>{if(e.touches.length===2){const d=distance(e.touches);if(pinchDistance)desiredScale=Math.max(.58,Math.min(1.32,desiredScale*d/pinchDistance));pinchDistance=d}else if(e.touches.length===1){desiredScale=Math.max(.58,Math.min(1.32,desiredScale+(dragY-e.touches[0].clientY)*.003));dragY=e.touches[0].clientY}},{passive:true});
    function resize(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
    const clock=new T.Clock();function tick(){const t=clock.getElapsedTime();root.rotation.y+=(px-root.rotation.y)*.035;root.rotation.x=-.08+(py-root.rotation.x+.08)*.025;root.scale.lerp(new T.Vector3(desiredScale,desiredScale,desiredScale),.08);boat.position.y=-.55+Math.sin(t*2)*.06;boat.rotation.z=Math.sin(t*2)*.04;buoy.position.y=-.61+Math.sin(t*2.3)*.05;keeper.rotation.y=Math.sin(t*.75)*.16;gull.position.y=2.5+Math.sin(t*2)*.12;gull.rotation.z=Math.sin(t*2)*.12;sun.rotation.z=t*.14;gem.rotation.y=t*.9;sparkles.forEach((s,i)=>{s.rotation.y=t*2;s.position.y=-.57+Math.sin(t*2+i)*.04});lamp.material.emissive && lamp.material.emissive.setHex(0xffcc55);renderer.render(scene,camera);requestAnimationFrame(tick)}tick();
  }wait();
})();
