
import './css/styles.scss'


import * as THREE from 'three'
import * as YUKA from 'yuka'


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'




const characterUrl = new URL('../assets/robot.fbx', import.meta.url)


const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
})


renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.outputColorSpace = THREE.SRGBColorSpace

renderer.setPixelRatio(window.devicePixelRatio)


const mainSceneDiv: HTMLElement = document.getElementById('mainScene') as HTMLElement

mainSceneDiv.appendChild(renderer.domElement)

const newDiv = document.createElement('div')

newDiv.className = 'progress'
mainSceneDiv.appendChild(newDiv)





const { offsetHeight: height, offsetWidth: width } = mainSceneDiv
let aspectRatio = width / height

const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000 )


renderer.setSize(width, height)



const clock = new THREE.Clock()

let mixer: THREE.AnimationMixer





const cubeSide = 1200

const geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(cubeSide, cubeSide)
const material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b2735,
    side: THREE.DoubleSide
})
const cube = new THREE.Mesh(geometry, material)


scene.add(cube)

cube.rotation.x = - 0.5 * Math.PI

cube.castShadow = true
cube.receiveShadow = true





const controls = new OrbitControls(camera, renderer.domElement)



camera.position.set(25.80, 5.39, -7.75)
controls.update()



scene.fog = new THREE.FogExp2(0x1b2735, 0.02)





const loader = new FBXLoader()


let walking: THREE.AnimationClip | null = null



let lines: THREE.LineLoop


const createPath = (): YUKA.Path => {

    const path: YUKA.Path = new YUKA.Path()

    const base = THREE.MathUtils.randInt(18, 24) * 1.2
    const half = THREE.MathUtils.randInt(16, 18) * 1.2
    const distant = THREE.MathUtils.randInt(33, 66) * 1.2


    path.add(new YUKA.Vector3(-half, 0, base))
    path.add(new YUKA.Vector3(-distant, 0, 10))
    path.add(new YUKA.Vector3(-half, 0, -half))
    path.add(new YUKA.Vector3(-distant / 4, 0, -base))
    path.add(new YUKA.Vector3(distant / 3, 0, -half))
    path.add(new YUKA.Vector3(half, 0, 6))
    path.add(new YUKA.Vector3(6, 0, half))
    path.add(new YUKA.Vector3(-half, 0, base))

    path.loop = true


    if (lines) {

        scene.remove(lines)
    }


    const position = []

    for (const waypoint of path._waypoints) {

        position.push(waypoint.x, waypoint.y, waypoint.z)
    }

    const lineGeometry: THREE.BufferGeometry = new THREE.BufferGeometry()

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3))

    const lineMaterial: THREE.LineBasicMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF })

    lines = new THREE.LineLoop(lineGeometry, lineMaterial)

    scene.add(lines)


    return path
}


let time: YUKA.Time
let entityManager: YUKA.EntityManager
let path: YUKA.Path

let robot: YUKA.Vehicle
let followPathBehavior: YUKA.FollowPathBehavior
let onPathBehavior: YUKA.OnPathBehavior


const MAX_SPEED = 15
const DEFAULT_SCALE = 0.01

const DEFAULT_DISTANCE = 9


const updatePathBehavior = (path: YUKA.Path) => {

    if (robot) {

        followPathBehavior && robot.steering.remove(followPathBehavior)
        onPathBehavior && robot.steering.remove(onPathBehavior)


        robot.position.copy(path.current())

        followPathBehavior = new YUKA.FollowPathBehavior(path, DEFAULT_DISTANCE)

        robot.steering.add(followPathBehavior)
        robot.maxSpeed = MAX_SPEED

        onPathBehavior = new YUKA.OnPathBehavior(path)

        // onPathBehavior.radius = 0.8
        robot.steering.add(onPathBehavior)


        // const wanderBehavior: YUKA.WanderBehavior = new YUKA.WanderBehavior()

        // robot.steering.add(wanderBehavior)
    }
}


const initYukaVehicle = (object: THREE.Group) => {

    path = createPath()
    robot = new YUKA.Vehicle()

    robot.setRenderComponent(object, sync)

    object.matrixAutoUpdate = false

    updatePathBehavior(path)


    robot.scale = new YUKA.Vector3(DEFAULT_SCALE, DEFAULT_SCALE, DEFAULT_SCALE)

    entityManager = new YUKA.EntityManager()
    entityManager.add(robot)

    time = new YUKA.Time()
}



/**
 * Callback for YUKA Vehicle
 * @param entity
 * @param renderComponent
 */
function sync(entity, renderComponent) {

    renderComponent.matrix.copy(entity.worldMatrix)
}



loader.load(characterUrl.href, (object) => {

    // object.scale.setScalar(DEFAULT_SCALE)

    // object.traverse(child => {

    //     if (child.isMesh) {

    //         child.castShadow = true
    //         child.receiveShadow = true
    //     }
    // })

    object.castShadow = true
    object.receiveShadow = true


    const animations = object.animations

    try {

        walking = THREE.AnimationClip.findByName(animations, 'Armature.001|Walk')

    } catch (error) {

        console.error('🚀 ~ file: game.js:132 ~ loader.load ~ error:', error)
    }


    initYukaVehicle(object)


    if (walking) {

        mixer = new THREE.AnimationMixer(object)

        const action = mixer.clipAction(walking)

        action.play()
    }


    scene.add(object)


    newDiv.className = 'hidden'
},
(data) => {

    const { loaded, total } = data || {}
    const percentage = Math.round(loaded / total * 100)

    newDiv.innerText = `${percentage}% loaded`
})




const initLight = (): void => {

    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x090a0f, 1)

    scene.add(hemiLight)

    const backLight = new THREE.DirectionalLight(0x000000, 0.4)

    backLight.position.set(200, 200, 50)
    backLight.castShadow = true

    scene.add(backLight)


    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.6)

    directionalLight.position.set(0, 10, 10)
    directionalLight.castShadow = true

    scene.add(directionalLight)
}

initLight()




const animate = () => {

    if (time && entityManager) {

        const delta: number = time.update().getDelta()

        entityManager.update(delta)
    }

    if (mixer) {

        const delta = clock.getDelta()

        mixer.update(delta)
    }

    renderer.render(scene, camera)
}


renderer.setAnimationLoop(animate)



window.addEventListener('resize', function() {

    const { offsetHeight: height, offsetWidth: width } = mainSceneDiv

    aspectRatio = width / height

    camera.aspect = aspectRatio
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
})


const cameraInitPositionZ = camera.position.z
const cameraInitPositionX = camera.position.x


window.addEventListener('scroll', function (event) {

    const position = window.scrollY

    camera.position.z = cameraInitPositionZ + position / 80
    camera.position.x = cameraInitPositionX - position / 80


    controls.update()
})
