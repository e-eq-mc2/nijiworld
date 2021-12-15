import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import { Rainbow }  from  './Rainbow.js'
const Common = require("./lib/common.js")

let scene,
  camera,
  renderer,
  control,
  stats,
  composer

let rainbows
let lastUpdate = performance.now()


const bloomParams = {
  exposure: 1,
  bloomStrength: 1.2,
  bloomThreshold: 0,
  bloomRadius: 0
}

init()
animate()

function init() {
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight )
  renderer.toneMapping = THREE.ReinhardToneMapping
  document.body.appendChild( renderer.domElement )

  scene = new THREE.Scene()

	camera = new THREE.PerspectiveCamera(
    80, 
    window.innerWidth / window.innerHeight,
    1, 
    300
  );
	camera.position.z = -100
	scene.add(camera);

  //scene.add( new THREE.AmbientLight( 0x404040 ) )
  //scene.add( new THREE.PointLight( 0xffffff, 2, 50, 1) )

  const renderPass = new RenderPass( scene, camera )
  const bloomPass  = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 )
  bloomPass.threshold = bloomParams.bloomThreshold
  bloomPass.strength  = bloomParams.bloomStrength

  composer = new EffectComposer( renderer )
  composer.addPass( renderPass )
  composer.addPass( bloomPass  )

  // カメラコントローラーを作成
  const controls = new OrbitControls(camera, renderer.domElement)
  //controls.zoomSpeed = 0.2

  stats = new Stats()
  document.body.appendChild( stats.dom )

  // 座標軸を表示
  var axes = new THREE.AxisHelper(25);
  scene.add(axes);

  const size = 50
  const divisions = 50
  const gridHelper = new THREE.GridHelper( size, divisions )
  //scene.add( gridHelper )

  rainbows = []
  rainbows.push( new Rainbow(scene, 200, 90, 0, 0, 0) )

  window.addEventListener( 'resize', onWindowResize )
  window.addEventListener('click', onMouseClick, false);

  const gui = new GUI();
  GUI.TEXT_CLOSED = ''
  //GUI.TEXT_OPEN   = ''
  gui.add( bloomParams, 'exposure', 0.1, 2 ).onChange( function ( value ) {

    renderer.toneMappingExposure = Math.pow( value, 4.0 );

  } );

  gui.add( bloomParams, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

    bloomPass.threshold = Number( value );

  } );

  gui.add( bloomParams, 'bloomStrength', 0.0, 2.0 ).onChange( function ( value ) {

    bloomPass.strength = Number( value );

  } );

  gui.add( bloomParams, 'bloomRadius', 0.0, 2.0 ).step( 0.01 ).onChange( function ( value ) {

    bloomPass.radius = Number( value );

  } );

}

function onWindowResize() {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()

  renderer.setSize(w, h)
  composer.setSize(w, h)

  for (const r of rainbows) {
    r.updateResolution(w, h)
  }
}

function onMouseClick(e) {
  let vec = new THREE.Vector3(); // create once and reuse
  let pos = new THREE.Vector3(); // create once and reuse

  vec.set(
      ( e.clientX / window.innerWidth  ) * 2 - 1,
    - ( e.clientY / window.innerHeight ) * 2 + 1,
    0.5 
  )

  vec.unproject( camera );
  vec.sub( camera.position ).normalize();

  const targetZ = 0
  const distance = (targetZ - camera.position.z) / vec.z
  pos.copy( camera.position ).add( vec.multiplyScalar( distance ) )

  const r = Common.randomReal(50, 150)
  //const x = Common.randomReal(-100, 100)
  //const z = Common.randomReal(-100, 100)
  const n =  Math.round(  (r / 80) * 150 )
  rainbows.push( new Rainbow(scene, n, r, pos.x, 0, pos.z) )
}

function animate() {
  const now = performance.now()
  const dt = (now - lastUpdate) / 1000

  requestAnimationFrame( animate )
  render()

  for (const r of rainbows) {
    r.update(dt)
  }

  lastUpdate = now
}

function render() {
  //renderer.render( scene, camera )
  composer.render()
  stats.update()

  renderer.info.reset()
}

//looks for key presses and logs them
document.body.addEventListener("keydown", function(e) {
  console.log(`key: ${e.key}`)

  switch(true) {
    case e.key == 'p':
      //console.log(`window.devicePixelRatio: ${window.devicePixelRatio}`)
      console.log(`Scene polycount     : ${renderer.info.render.triangles}`)
      console.log(`Active Drawcalls    : ${renderer.info.render.calls}`)
      console.log(`Textures in Memory  : ${renderer.info.memory.textures}`)
      console.log(`Geometries in Memory: ${renderer.info.memory.geometries}`)
      break

    case e.key == 'a':

      break

    default:
      break
  }
})
