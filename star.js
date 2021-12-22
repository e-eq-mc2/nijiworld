const THREE            = require('three')
const MeshLine         = require('three.meshline').MeshLine;
const MeshLineMaterial = require('three.meshline').MeshLineMaterial;
const Common           = require("./lib/common.js")
import CubicBezier from 'cubic-bezier-easing'

export class Star {
  constructor(path, t = 0, speedSec = 5) {
    this.path     = path
    this.t        = t
    this.speedSec = speedSec
    this.dwell    = 0
    this.maxDwell = 2
  }

  initLine(color, resolution) {
    this.line = new Star.Line(this.position(), color, resolution)
    return this.line.mesh
  }

  position() {
    const t = this.t / this.speedSec
    const pos = this.path.getPoint(t)
    return pos
  }

  update(dt = 0.03) {
    if ( this.shouldProceed() ) {
      this.t += dt
      this.line.update( this.position() )
    } else {
      if ( this.isDwelling() ) {
        this.dwell += dt
        const pos = this.position()
        this.line.update( this.position() )
      } else {
        this.t     = 0 
        this.dwell = 0 
        const pos = this.position()
        this.line.align(pos)
      }
    }
  }

  shouldProceed() {
    return this.dwell == 0 && this.t <= this.speedSec * 0.5
  }

  isDwelling() {
    return this.dwell < this.maxDwell
  }
}

// https://zenn.dev/mebiusbox/books/8d9c42883df9f6/viewer/66a2a2

Star.Line = class {
  constructor(position, color, resolution) {
    // Create the line mesh
    this.meshLine = new MeshLine()
    this.align(position)
    this.initMesh(color, resolution)
  }

  align(to) {
    this.lineLength = 100
    const points = []
    for (let i=0; i < this.lineLength; ++i) {
      points.push(to)
    }

    this.meshLine.setPoints(points, p => { return p * 0.6+ 0.4} ) // makes width taper (p is a decimal percentage of the number of points)
  }

  initMesh(color, resolution) {
    const material = this.createMaterial(color, resolution)

    this.mesh = new THREE.Mesh(this.meshLine.geometry, material)
    this.mesh.frustumCulled = false

    return this.mesh
  }

  createMaterial(color, resolution) {
    // Create the line material
    const material = new MeshLineMaterial({
      color: color,
      opacity: 1,
      resolution: resolution,
      sizeAttenuation: 2,
      lineWidth: 0.4,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      transparent: false,
      //side: THREE.DoubleSide
    })

    return material
  }

  updateResolution(r) {
    this.mesh.material.uniforms.resolution.value.copy( r );
  }

  update(pos) {
    // Advance the trail by one position
    this.meshLine.advance(pos)
  }
}
