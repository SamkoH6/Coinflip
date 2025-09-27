'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { RGBELoader } from 'three-stdlib' // nice for Next/React

type Props = {
  // optional forced sequence like your demo: e.g. ['H','T','H']
  sequence?: Array<'H' | 'T'>
  // called when spin finishes with 'H' or 'T'
  onResult?: (r: 'H' | 'T') => void
  // show the floating button (you can hide and trigger externally)
  showButton?: boolean
  className?: string
}

export type CoinFlip3DHandle = {
  spin: () => void
}

const CoinFlip3D = forwardRef<CoinFlip3DHandle, Props>(function CoinFlip3D(
  { sequence = ['H', 'T', 'H', 'H', 'T'], onResult, showButton = true, className = '' }: Props,
  ref,
) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  // internal refs (mutable objects, not state)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const coinGroupRef = useRef<THREE.Group | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const frameRef = useRef<number | null>(null)
  const seqIndexRef = useRef(0)

  // spin state
  const spinRef = useRef({
    spinning: false,
    spinStart: 0,
    spinDuration: 1800,
    startX: 0,
    targetAngle: 0,
    baseTiltX: Math.PI / 2,
    showingHeads: true,
    nextIsHeads: false,
    TOSS_APEX: 1.0,
  })

  // shared helpers
  const TWO_PI = Math.PI * 2
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easeInQuad = (t: number) => t * t

  function triggerSpin() {
    const mesh = meshRef.current
    if (!mesh) return
    const { spinning, baseTiltX } = spinRef.current
    if (spinning) return

    const now = performance.now()
    spinRef.current.spinning = true
    spinRef.current.spinStart = now

    // normalize current rotation relative to base tilt
    let current = (mesh.rotation.x - baseTiltX) % TWO_PI
    if (current < 0) current += TWO_PI

    // which face is showing?
    spinRef.current.showingHeads = current < Math.PI * 0.5 || current > Math.PI * 1.5

    // forced outcome
    const token = sequence[seqIndexRef.current % sequence.length]
    spinRef.current.nextIsHeads = token === 'H'
    seqIndexRef.current++

    // snap start to current face
    spinRef.current.startX = spinRef.current.showingHeads ? baseTiltX : baseTiltX + Math.PI

    // 2–4 extra spins
    const spins = 2 + Math.floor(Math.random() * 3)

    // compute target angle with spins and chosen face
    spinRef.current.targetAngle =
      baseTiltX + spins * TWO_PI + (spinRef.current.nextIsHeads ? 0 : Math.PI)
  }

  // expose spin() to parent
  useImperativeHandle(ref, () => ({
    spin: triggerSpin,
  }))

  useEffect(() => {
    if (!mountRef.current) return

    // --- renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // --- scene & camera ---
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100,
    )
    camera.position.set(0, 0, 3)
    cameraRef.current = camera
    scene.add(camera)

    // --- environment (HDR) ---
    const pmrem = new THREE.PMREMGenerator(renderer)
    pmrem.compileEquirectangularShader()
    let hdrTex: THREE.DataTexture | null = null
    new RGBELoader()
      .setPath('https://threejs.org/examples/textures/equirectangular/')
      .load('royal_esplanade_1k.hdr', (hdr) => {
        hdrTex = hdr
        const envMap = pmrem.fromEquirectangular(hdr).texture
        scene.environment = envMap
        // scene.background = envMap // uncomment if you want the HDR background visible
        hdr.dispose()
        pmrem.dispose()
      })

    // --- textures ---
    const loader = new THREE.TextureLoader()
    const heads = loader.load('images/coins/coin_heads.png')
    const tails = loader.load('images/coins/coin_tails.png')
    heads.colorSpace = THREE.SRGBColorSpace
    tails.colorSpace = THREE.SRGBColorSpace

    heads.center.set(0.5, 0.5)
    tails.center.set(0.5, 0.5)
    heads.rotation = Math.PI / 2
    tails.rotation = Math.PI / 2

    tails.wrapS = tails.wrapT = THREE.RepeatWrapping
    tails.repeat.x = -1
    tails.repeat.y = -1

    const maxAniso = renderer.capabilities.getMaxAnisotropy()
    heads.anisotropy = maxAniso
    tails.anisotropy = maxAniso

    // --- geometry & materials ---
    const geo = new THREE.CylinderGeometry(0.6, 0.6, 0.06, 64, 1, false)
    const sideMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 1.0,
      roughness: 0.15,
      envMapIntensity: 1.2,
    })
    const topMat = new THREE.MeshStandardMaterial({
      map: heads,
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.2,
    })
    const bottomMat = new THREE.MeshStandardMaterial({
      map: tails,
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.2,
    })

    const mesh = new THREE.Mesh(geo, [sideMat, topMat, bottomMat])
    mesh.rotation.x = spinRef.current.baseTiltX
    meshRef.current = mesh

    const coin = new THREE.Group()
    coin.add(mesh)
    coinGroupRef.current = coin
    scene.add(coin)

    // --- lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 10))

    // expose a click on a local button if shown
    const onBtnClick = () => triggerSpin()
    if (btnRef.current) btnRef.current.addEventListener('click', onBtnClick)

    // --- render loop ---
    const loop = (time = 0) => {
      const { spinning, spinStart, spinDuration, startX, targetAngle, TOSS_APEX } = spinRef.current
      if (spinning) {
        const t = Math.min(1, (time - spinStart) / spinDuration) // 0..1
        const eased = easeOutCubic(t)

        // rotation
        mesh.rotation.x = startX + eased * (targetAngle - startX)

        // toss arc
        const DOWN_START = 0.6
        const DOWN_BOOST = 1.6
        let y: number
        if (t < DOWN_START) {
          const u = t / DOWN_START
          y = TOSS_APEX * easeOutCubic(u)
        } else {
          let v = (t - DOWN_START) / (1 - DOWN_START)
          v = Math.min(Math.max(v * DOWN_BOOST, 0), 1)
          y = TOSS_APEX * (easeInQuad(v) * -1 + 1)
        }
        coin.position.y = y

        if (t >= 1) {
          mesh.rotation.x = targetAngle
          coin.position.y = 0
          spinRef.current.spinning = false
          const result: 'H' | 'T' = spinRef.current.nextIsHeads ? 'H' : 'T'
          onResult?.(result)
        }
      }

      renderer.render(scene, camera)
      frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)

    // --- resize ---
    const onResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      rendererRef.current.setSize(w, h)
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // cleanup
    return () => {
      window.removeEventListener('resize', onResize)
      if (btnRef.current) btnRef.current.removeEventListener('click', onBtnClick)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      // dispose
      geo.dispose()
      ;[sideMat, topMat, bottomMat].forEach((m) => m.dispose())
      heads.dispose()
      tails.dispose()
      renderer.dispose()
      // remove canvas
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement)
      }
      // clear refs
      rendererRef.current = null
      sceneRef.current = null
      cameraRef.current = null
      coinGroupRef.current = null
      meshRef.current = null
    }
  }, [onResult, sequence])

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Canvas mount point */}
      <div ref={mountRef} className="absolute inset-0" />
      {/* Floating button (optional) */}
      {showButton && (
        <button
          ref={btnRef}
          onClick={triggerSpin}
          className="absolute right-[20%] bottom-1/2 translate-y-1/2 rounded-lg bg-[#ff7a00] px-4 py-2 text-white shadow-xl text-xl font-semibold"
        >
          Spin coin
        </button>
      )}
    </div>
  )
})

export default CoinFlip3D
