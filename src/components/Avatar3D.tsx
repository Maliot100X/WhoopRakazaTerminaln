import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Hand, SkipForward, Volume2 } from 'lucide-react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm'

let LIVE: string | null = null
const LINES = [
  "Hey, I'm Rakaza. I watch every coin launched through this terminal.",
  'The ring around each coin in the Universe tab shows how far along its bonding curve is.',
  'Launches here use a 70/30 fee split. Self launches keep 100%.',
  "I'll never ask for your seed phrase or private key. Nobody legit will.",
  'Check the Market tab for what is trending on Solana right now.',
]

export function Avatar3D() {
  const talk = useRef({ text: '', shown: 0, t: 0 })
  const [line, setLine] = useState(0)
  const [live, setLive] = useState<string | null>(LIVE)
  useEffect(() => {
    fetch('https://api.dexscreener.com/tokens/v1/solana/So11111111111111111111111111111111111111112').then((r) => r.json()).then((d: { priceUsd?: string; priceChange?: { h24?: number } }[]) => {
      const p = d?.[0]; if (p?.priceUsd) { LIVE = `Solana is at $${Number(p.priceUsd).toFixed(2)} right now, ${(p.priceChange?.h24 ?? 0) >= 0 ? 'up' : 'down'} ${Math.abs(p.priceChange?.h24 ?? 0).toFixed(1)}% in 24 hours.`; setLive(LIVE) }
    }).catch(() => {})
  }, [])
  const lines = live ? [...LINES.slice(0, 2), live, ...LINES.slice(2)] : LINES
  const [typed, setTyped] = useState('')
  const host = useRef<HTMLDivElement>(null)
  const wave = useRef(0)
  const [pct, setPct] = useState(0)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const setTypedRef = useRef(setTyped); setTypedRef.current = setTyped
  useEffect(() => { talk.current = { text: lines[line % lines.length], shown: 0, t: 0 } }, [line, live])
  useEffect(() => { const id = setInterval(() => setLine((l) => l + 1), 7000); return () => clearInterval(id) }, [])

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50)
    camera.position.set(0, 1.35, 3.1)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6a3cff, 1.1))
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(1.5, 2.5, 2.5); scene.add(key)
    const rim = new THREE.DirectionalLight(0xff4da6, 2.5); rim.position.set(-2, 2, -2); scene.add(rim)
    const mint = new THREE.PointLight(0x3ff0c3, 6, 8); mint.position.set(2, 0.5, 1); scene.add(mint)

    // floating particles + ground ring
    const N = 160, pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) pos.set([(Math.random() - 0.5) * 5, Math.random() * 3, (Math.random() - 0.5) * 3 - 0.5], i * 3)
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const particles = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffc933, size: 0.03, transparent: true, opacity: 0.8 }))
    scene.add(particles)
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.6, 64), new THREE.MeshBasicMaterial({ color: 0x3ff0c3, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }))
    ringMesh.rotation.x = -Math.PI / 2; ringMesh.position.y = 0.01; scene.add(ringMesh)
    const ring2 = ringMesh.clone(); ring2.scale.setScalar(1.5); (ring2.material as THREE.MeshBasicMaterial) = (ringMesh.material as THREE.MeshBasicMaterial).clone(); (ring2.material as THREE.MeshBasicMaterial).color.set(0xff4da6); scene.add(ring2)

    const frame = { mid: new THREE.Vector3(0, 0.9, 0), h: 1.7, w: 0.8 }
    const fit = () => {
      const vfov = (camera.fov * Math.PI) / 180
      const needH = (frame.h * 1.55) / 2 / Math.tan(vfov / 2)
      const needW = (frame.w * 1.5) / 2 / (Math.tan(vfov / 2) * camera.aspect)
      const d = Math.max(needH, needW)
      camera.position.set(0, frame.mid.y, frame.mid.z + d)
      camera.lookAt(frame.mid.x, frame.mid.y + frame.h * 0.07, frame.mid.z)
    }
    let restHips = 0
    const pivot = new THREE.Group(); scene.add(pivot)
    let vrm: VRM | null = null
    let disposed = false
    const loader = new GLTFLoader()
    loader.register((p) => new VRMLoaderPlugin(p))
    loader.load('/brand/rakaza.vrm', (gltf) => {
      if (disposed) return
      vrm = gltf.userData.vrm as VRM
      VRMUtils.rotateVRM0(vrm)
      vrm.scene.traverse((o) => { o.frustumCulled = false })
      pivot.add(vrm.scene)
      const h = vrm.humanoid
      h.getNormalizedBoneNode('leftUpperArm')!.rotation.z = 1.28
      h.getNormalizedBoneNode('rightUpperArm')!.rotation.z = -1.28
      // frame the model from its real bounding box so it always fits the view
      pivot.updateMatrixWorld(true)
      const wp = (n: string) => h.getNormalizedBoneNode(n as 'head')!.getWorldPosition(new THREE.Vector3())
      const head = wp('head'), foot = Math.min(wp('leftFoot').y, wp('rightFoot').y)
      restHips = h.getNormalizedBoneNode('hips')!.position.y
      const top = head.y + 0.28, bottom = foot - 0.03
      frame.h = top - bottom; frame.w = 0.9
      frame.mid.set(0, (top + bottom) / 2, 0)
      ringMesh.position.y = bottom + 0.02; ring2.position.y = bottom + 0.02
      fit()
      setReady(true)
    }, (e) => e.total && setPct(Math.round((e.loaded / e.total) * 100)), () => setFailed(true))

    let tx = 0, ty = 0
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width) * 2 - 1; ty = ((e.clientY - r.top) / r.height) * 2 - 1
    }
    window.addEventListener('pointermove', move)
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); fit() }
    const ro = new ResizeObserver(resize); ro.observe(el); resize()

    const clock = new THREE.Clock()
    let raf = 0, nextBlink = 2, blinkT = -1, hx = 0, hy = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const dt = clock.getDelta(), t = reduce ? 0 : clock.elapsedTime
      particles.rotation.y = t * 0.08; particles.position.y = Math.sin(t * 0.6) * 0.05
      ringMesh.rotation.z = t * 0.6; ring2.rotation.z = -t * 0.3
      ;(ringMesh.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 2) * 0.25
      if (vrm) {
        const h = vrm.humanoid
        hx += (tx * 0.5 - hx) * 0.06; hy += (ty * 0.3 - hy) * 0.06
        const head = h.getNormalizedBoneNode('head')!, neck = h.getNormalizedBoneNode('neck')!
        head.rotation.y = hx * 0.6; head.rotation.x = hy * 0.5; neck.rotation.y = hx * 0.4
        pivot.rotation.y = hx * 0.35
        const chest = h.getNormalizedBoneNode('chest')!; chest.rotation.x = Math.sin(t * 1.5) * 0.015
        h.getNormalizedBoneNode('spine')!.rotation.z = Math.sin(t * 0.8) * 0.02
        const hips = h.getNormalizedBoneNode('hips')!; hips.position.y = restHips + Math.sin(t * 1.5) * 0.004
        const rArm = h.getNormalizedBoneNode('rightUpperArm')!, rLow = h.getNormalizedBoneNode('rightLowerArm')!
        const lArm = h.getNormalizedBoneNode('leftUpperArm')!
        lArm.rotation.z = 1.28 + Math.sin(t * 1.5) * 0.02
        if (wave.current > 0) {
          wave.current = Math.max(0, wave.current - dt)
          const k = Math.min(1, wave.current / 0.4, (2.4 - wave.current) / 0.4)
          rArm.rotation.z = -1.28 + k * 2.05
          rLow.rotation.z = k * (-0.5 + Math.sin(t * 12) * 0.5)
          vrm.expressionManager?.setValue('happy', k)
        } else {
          rArm.rotation.z = -1.28 + Math.sin(t * 1.5 + 1) * 0.02; rLow.rotation.z = 0
          vrm.expressionManager?.setValue('happy', 0.15 + Math.sin(t * 0.7) * 0.1)
        }
        nextBlink -= dt
        if (nextBlink < 0 && blinkT < 0) { blinkT = 0; nextBlink = 2 + Math.random() * 3 }
        if (blinkT >= 0) { blinkT += dt; vrm.expressionManager?.setValue('blink', Math.sin(Math.min(1, blinkT / 0.18) * Math.PI)); if (blinkT > 0.18) blinkT = -1 }
        const tk = talk.current
        let mouth = 0
        if (tk.shown < tk.text.length) { tk.t += dt; while (tk.t > 0.035) { tk.t -= 0.035; tk.shown++ } mouth = 0.35 + 0.35 * Math.abs(Math.sin(performance.now() / 85)) }
        vrm.expressionManager?.setValue('aa', mouth)
        setTypedRef.current(tk.text.slice(0, tk.shown))
        vrm.update(dt)
      }
      renderer.render(scene, camera)
    }
    tick()
    return () => {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('pointermove', move)
      if (vrm) { pivot.remove(vrm.scene); VRMUtils.deepDispose(vrm.scene) }
      pg.dispose(); renderer.dispose(); el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-card border-2 border-line bg-[radial-gradient(ellipse_at_50%_30%,#3a1c9a_0%,#120828_70%)]">
      <div ref={host} className="h-[72vh] min-h-[460px] max-h-[760px] w-full" />
      {!ready && !failed && (
        <div className="absolute inset-0 grid place-items-center text-center">
          <div><p className="font-mono text-sm text-muted">Summoning Rakaza… {pct}%</p><div className="mx-auto mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} /></div></div>
        </div>
      )}
      {failed && <p className="absolute inset-0 grid place-items-center p-6 text-center text-muted">Your device couldn't load the 3D avatar.</p>}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-4">
        <p className="min-h-[4.5rem] rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-relaxed text-ink shadow-[0_20px_40px_rgba(0,0,0,.35)] backdrop-blur-md" aria-live="polite">
          <span className="font-mono text-xs text-accent">RAKAZA</span><br />{typed}<span className="ml-0.5 inline-block w-1.5 animate-pulse bg-accent">&nbsp;</span>
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-paper/80 to-transparent p-3 pt-8">
        <button onClick={() => { wave.current = 2.4 }} className="min-h-11 rounded-full border-2 border-ink bg-accent px-4 text-sm font-bold text-accent-ink"><Hand className="mr-1.5 inline size-4" aria-hidden />Say hi</button>
        <button onClick={() => setLine((l) => l + 1)} className="min-h-11 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-bold backdrop-blur-md"><SkipForward className="mr-1.5 inline size-4" aria-hidden />Next</button>
        <button onClick={() => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(lines[line % lines.length]); u.pitch = 1.3; speechSynthesis.speak(u) } catch { /* unsupported */ } }} className="min-h-11 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-bold backdrop-blur-md"><Volume2 className="mr-1.5 inline size-4" aria-hidden />Voice</button>
      </div>
    </div>
  )
}
