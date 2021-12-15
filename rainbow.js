const THREE    = require('three')
const Common   = require("./lib/common.js")
import { Star       }  from  './star.js'
import CubicBezier from 'cubic-bezier-easing'

export class Circle3D {
  constructor(r, x = 0, y = 0, z = 0) {
    this.r = r
    this.x = x
    this.y = y
    this.z = z
    this.direction = 1
  }

  getPoint(t) {
    const ang = t * 2 * Math.PI * this.direction
    const x = this.x + Math.cos(ang) * this.r
    const y = this.y + Math.sin(ang) * this.r * 1.2
    const z = this.z

    const p = new THREE.Vector3(x, y, z)
    return p
  }
}

export class Rainbow {
  constructor(scene, num, radius, x = 0, y = 0, z = 0) {
    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight)
    const ease = new CubicBezier(0.42, 0.0, 0.58, 1.0) // ease-in-out 
    const rMin = radius * 0.8
    const rMax = radius 
    const sMin = 50
    const sMax = 80
    this.stars = []
    for ( var i = 0; i < num; i ++ ) {
      const r = Common.randomReal(rMin, rMax)
      const s = Common.randomReal(sMin, sMax)
      const p = this.path(r, x, y, z)
      const t = Common.randomReal(0, s * 0.5)
      const star = new Star(p, t, s)

      const rate = (r - rMin) / (rMax-rMin)
      const c = this.color(ease(rate))
      const mesh = star.initLine(c, resolution)
      scene.add(mesh)
      this.stars[ i ] = star
    }
  }

  path(r, x, y, z) {
    const path = new Circle3D(r, x, y, z)
    return path
  }

  color(rate) {
    const minHue = 300
    const maxHue = 0
    const hue = Math.round((rate * (maxHue-minHue) ) + minHue)
    const c = "hsl(" + hue + ",100%,50%)"

    const color = new THREE.Color( c )
    return color
  }

  update(dt) {
    for (let i = 0; i < this.stars.length; i++ ) {
      const s = this.stars[ i ]
      s.update()
    }
  }

  updateResolution(w, h) {
    const r = new THREE.Vector2(w, h)

    this.stars.forEach( function ( s ) {
      s.line.updateResolution(r)
    } )
  }

}
 
