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
    function palm(x,z,scale){const p=new T.Group();p.position.set(x,0,z);p.scale.setScalar(scale);island.add(p);const trunk=new T.Mesh(new T.CylinderGeometry(.12,.18,1.5,7),mat(0x87552e));trunk.position.y=.75;trunk.rotation.z=.12;p.add(trunk);for(let i=0;i<7;i++){const leaf=new T.Mesh(new T.ConeGeometry(.18,1.15,4),mat(0x4e9d38));leaf.position.y=1.52;leaf.rotation.z=Math.PI/2;leaf.rotation.y=i*Math.PI*2/7;leaf.position.x=Math.cos(i*Math.PI*2/7)*.38;leaf.position.z=Math.sin(i*Math.PI*2/7)*.38;p.add(leaf)}}palm(-2.3,.1,1.1);palm(2.15,.7,.86);
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
    const clock=new T.Clock();function tick(){const t=clock.getElapsedTime();root.rotation.y+=(px-root.rotation.y)*.035;root.rotation.x=-.08+(py-root.rotation.x+.08)*.025;root.scale.lerp(new T.Vector3(desiredScale,desiredScale,desiredScale),.08);boat.position.y=-.55+Math.sin(t*2)*.06;boat.rotation.z=Math.sin(t*2)*.04;gem.rotation.y=t*.9;lamp.material.emissive && lamp.material.emissive.setHex(0xffcc55);renderer.render(scene,camera);requestAnimationFrame(tick)}tick();
  }wait();
})();
