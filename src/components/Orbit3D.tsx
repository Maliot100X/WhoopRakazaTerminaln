import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export type OrbitToken = { mint: string; name: string; symbol: string; image?: string; progress: number; mcap: number | null }

function makeBadge(img: HTMLImageElement | null, progress: number, label: string) {
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')!
  g.beginPath(); g.arc(s / 2, s / 2, 104, 0, Math.PI * 2); g.closePath()
  g.fillStyle = '#1c0f40'; g.fill()
  if (img) { g.save(); g.clip(); try { g.drawImage(img, 24, 24, s - 48, s - 48) } catch { /* tainted */ } g.restore() }
  else { g.fillStyle = '#ffc933'; g.font = 'bold 72px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label.slice(0, 4), s / 2, s / 2) }
  g.lineWidth = 14; g.strokeStyle = '#4a3a86'
  g.beginPath(); g.arc(s / 2, s / 2, 116, 0, Math.PI * 2); g.stroke()
  g.strokeStyle = progress >= 100 ? '#3ff0c3' : '#ffc933'; g.lineCap = 'round'
  g.beginPath(); g.arc(s / 2, s / 2, 116, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.03, Math.min(1, progress / 100))); g.stroke()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function Orbit3D({ tokens, onSelect }: { tokens: OrbitToken[]; onSelect: (mint: string) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const cb = useRef(onSelect)
  cb.current = onSelect

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    renderer.domElement.style.touchAction = 'pan-y'
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x120828, 0.012)
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
    camera.position.set(0, 4, 12)

    // starfield
    const N = 1400
    const pos = new Float32Array(N * 3)
    const col = new Float32Array(N * 3)
    const palette = [new THREE.Color('#ffc933'), new THREE.Color('#ff4da6'), new THREE.Color('#3ff0c3'), new THREE.Color('#b7aad6')]
    for (let i = 0; i < N; i++) {
      const r = 18 + Math.random() * 50, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1)
      pos.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)], i * 3)
      const k = palette[Math.floor(Math.random() * palette.length)]
      col.set([k.r, k.g, k.b], i * 3)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false }))
    scene.add(stars)

    // core
    const core = new THREE.Group()
    scene.add(core)
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), new THREE.MeshStandardMaterial({ color: 0x6a3cff, emissive: 0x3a1c9a, emissiveIntensity: 1.2, flatShading: true, metalness: 0.4, roughness: 0.35 }))
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 1), new THREE.MeshBasicMaterial({ color: 0xff4da6, wireframe: true, transparent: true, opacity: 0.45 }))
    const cc = document.createElement('canvas'); cc.width = cc.height = 256
    const cg = cc.getContext('2d')!
    cg.fillStyle = '#ffc933'; cg.fillRect(0, 0, 256, 256)
    cg.strokeStyle = '#b8860b'; cg.lineWidth = 10; cg.beginPath(); cg.arc(128, 128, 104, 0, Math.PI * 2); cg.stroke()
    cg.fillStyle = '#6a3cff'; cg.font = '900 150px sans-serif'; cg.textAlign = 'center'; cg.textBaseline = 'middle'; cg.fillText('R', 128, 138)
    const coinTex = new THREE.CanvasTexture(cc); coinTex.colorSpace = THREE.SRGBColorSpace
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.26, 64), [new THREE.MeshStandardMaterial({ color: 0xffc933, emissive: 0xb8860b, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.4 }), new THREE.MeshStandardMaterial({ map: coinTex, emissiveMap: coinTex, emissive: 0xffffff, emissiveIntensity: 0.45, metalness: 0.2, roughness: 0.45 }), new THREE.MeshStandardMaterial({ map: coinTex, emissiveMap: coinTex, emissive: 0xffffff, emissiveIntensity: 0.45, metalness: 0.2, roughness: 0.45 })])
    coin.rotation.x = Math.PI / 2
    const coinPivot = new THREE.Group(); coinPivot.add(coin)
    ico.visible = false
    core.add(ico, wire, coinPivot)
    const rings: THREE.Mesh[] = []
    ;[4.2, 6.4, 8.6].forEach((r, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: [0xffc933, 0xff4da6, 0x3ff0c3][i], transparent: true, opacity: 0.4 }))
      ring.rotation.x = Math.PI / 2 + (i - 1) * 0.12
      scene.add(ring); rings.push(ring)
    })
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const p1 = new THREE.PointLight(0xff4da6, 60, 40); p1.position.set(5, 4, 5); scene.add(p1)
    const p2 = new THREE.PointLight(0x3ff0c3, 50, 40); p2.position.set(-6, -2, 3); scene.add(p2)

    // token badges
    const hc = document.createElement('canvas'); hc.width = hc.height = 128
    const hg = hc.getContext('2d')!; const grd = hg.createRadialGradient(64, 64, 8, 64, 64, 64)
    grd.addColorStop(0, 'rgba(63,240,195,0.9)'); grd.addColorStop(1, 'rgba(63,240,195,0)'); hg.fillStyle = grd; hg.fillRect(0, 0, 128, 128)
    const haloTex = new THREE.CanvasTexture(hc)
    const shooters = Array.from({ length: 4 }, (_, i) => {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-2.2, 0.5, 0)])
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }))
      scene.add(l); return { l, life: i * 1.6, x: 0, y: 0, z: 0 }
    })
    const items: { halo?: THREE.Sprite; sprite: THREE.Sprite; radius: number; speed: number; phase: number; tilt: number; mint: string; baseScale: number }[] = []
    const loader = new THREE.ImageLoader()
    loader.setCrossOrigin('anonymous')
    const textures: THREE.Texture[] = []
    tokens.slice(0, 40).forEach((t, i) => {
      const ringIdx = i % 3
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeBadge(null, t.progress, t.symbol), transparent: true, depthWrite: false }))
      const baseScale = 1.5 + Math.min(0.9, (t.mcap ?? 0) / 3)
      sprite.scale.setScalar(baseScale)
      scene.add(sprite)
      let halo: THREE.Sprite | undefined
      if (t.progress >= 100) { halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(baseScale * 2.4); scene.add(halo) }
      items.push({ halo, sprite, radius: [4.2, 6.4, 8.6][ringIdx], speed: (0.16 - ringIdx * 0.035) * (i % 2 ? 1 : -1), phase: (Math.floor(i / 3) / Math.max(1, Math.ceil(tokens.length / 3))) * Math.PI * 2 + ringIdx * 1.1, tilt: (ringIdx - 1) * 0.12, mint: t.mint, baseScale })
      if (t.image) loader.load(t.image, (img) => {
        const tex = makeBadge(img, t.progress, t.symbol); textures.push(tex)
        const m = sprite.material as THREE.SpriteMaterial; m.map?.dispose(); m.map = tex; m.needsUpdate = true
      }, undefined, () => { /* keep fallback */ })
    })

    const ray = new THREE.Raycaster()
    const mouse = new THREE.Vector2(9, 9)
    let tx = 0, ty = 0, cx = 0, cy = 0, hover: number | null = null, down: { x: number; y: number } | null = null
    const setM = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect()
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      tx = mouse.x; ty = mouse.y
    }
    const onMove = (e: PointerEvent) => setM(e)
    const onDown = (e: PointerEvent) => { setM(e); down = { x: e.clientX, y: e.clientY } }
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) { down = null; return }
      down = null; setM(e); ray.setFromCamera(mouse, camera)
      const hit = ray.intersectObjects(items.map((i) => i.sprite))[0]
      if (hit) { const it = items.find((i) => i.sprite === hit.object); if (it) cb.current(it.mint) }
    }
    const onLeave = () => { mouse.set(9, 9); tx = ty = 0 }
    const cv = renderer.domElement
    cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointerup', onUp); cv.addEventListener('pointerleave', onLeave)

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h); camera.aspect = w / h
      camera.position.z = w < 520 ? 20 : 16
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize); ro.observe(el); resize()

    const clock = new THREE.Clock()
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const t = reduce ? 0 : clock.getElapsedTime()
      core.rotation.y = 0; core.rotation.x = 0; coinPivot.rotation.y = t * 0.9; coinPivot.position.y = Math.sin(t * 1.2) * 0.12
      const pulse = 1 + Math.sin(t * 1.6) * 0.04
      ico.scale.setScalar(pulse); wire.rotation.y = -t * 0.4; wire.rotation.z = t * 0.2
      rings.forEach((r, i) => { r.rotation.z = t * 0.05 * (i + 1) })
      stars.rotation.y = t * 0.012
      cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05
      camera.position.x = cx * 2.2; camera.position.y = 4 + cy * 1.2
      camera.lookAt(0, 0, 0)
      ray.setFromCamera(mouse, camera)
      const hit = ray.intersectObjects(items.map((i) => i.sprite))[0]
      hover = hit ? items.findIndex((i) => i.sprite === hit.object) : null
      cv.style.cursor = hover != null ? 'pointer' : 'default'
      items.forEach((it, i) => {
        const a = it.phase + t * it.speed
        it.sprite.position.set(Math.cos(a) * it.radius, Math.sin(a * 2 + it.phase) * 0.5 + it.tilt * Math.cos(a) * it.radius * 0.4, Math.sin(a) * it.radius)
        if (it.halo) { it.halo.position.copy(it.sprite.position); it.halo.scale.setScalar(it.baseScale * (2.3 + Math.sin(t * 2 + i) * 0.25)) }
        const target = it.baseScale * (hover === i ? 1.35 : 1)
        it.sprite.scale.setScalar(it.sprite.scale.x + (target - it.sprite.scale.x) * 0.15)
      })
      shooters.forEach((sh) => {
        sh.life += 0.016
        if (sh.life > 6.4) { sh.life = 0; sh.x = 14 + Math.random() * 6; sh.y = 2 + Math.random() * 8; sh.z = -6 - Math.random() * 6 }
        const k = sh.life / 1.4
        sh.l.position.set(sh.x - k * 34, sh.y - k * 7, sh.z)
        ;(sh.l.material as THREE.LineBasicMaterial).opacity = k < 1 ? Math.sin(k * Math.PI) * 0.9 : 0
      })
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf); ro.disconnect()
      cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointerup', onUp); cv.removeEventListener('pointerleave', onLeave)
      items.forEach((i) => { (i.sprite.material as THREE.SpriteMaterial).map?.dispose(); i.sprite.material.dispose() })
      textures.forEach((x) => x.dispose()); haloTex.dispose(); shooters.forEach((x) => { x.l.geometry.dispose(); (x.l.material as THREE.Material).dispose() })
      starGeo.dispose(); renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [tokens])

  return <div ref={host} className="h-full w-full" />
}
