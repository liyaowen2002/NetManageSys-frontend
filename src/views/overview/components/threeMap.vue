<template>
  <div>
    <div ref="sceneContainer" class="scene-container"></div>
    <!-- <button @click="logCameraPosition()" style="position: absolute; top: 520px; right: 20px">
      Log Camera Position
    </button> -->
    <!-- <button @click="logCameraPosition1()" style="position: absolute; top: 520px; left: 180px">
      Log Camera Position1
    </button> -->
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js' // 用于平滑动画过渡

const sceneContainer = ref() // 这是挂载Three.js场景的容器
let scene: InstanceType<THREE.Scene>,
  camera: InstanceType<THREE.PerspectiveCamera>,
  renderer: InstanceType<THREE.Scene>,
  controls: InstanceType<OrbitControls>,
  model: InstanceType<THREE.Scene>
const raycaster = new THREE.Raycaster() // 用于射线投射
const mouse = new THREE.Vector2() // 用于存储鼠标的坐标

// 当前点击的物体
const currentClickObject = ref(null)
// 保存上一个点击物体的原始材质
let previousMaterial: null | InstanceType<THREE.material> = null
const normalTexture = new THREE.TextureLoader().load('/matcap/normal.png')
const seletedTexture = new THREE.TextureLoader().load('/matcap/blue.png')
const emits = defineEmits([
  'closeModalAndExitView',
  'openModal',
  'closeModalOnly',
  'getInfoToUpdate',
])

// 初始化函数
const initThreeJS = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    15,
    sceneContainer.value.clientWidth / sceneContainer.value.clientHeight,
    0.1,
    1000,
  )
  camera.position.copy(initialCameraPosition)

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    precision: 'highp',
  })
  renderer.setClearAlpha(0.0)
  renderer.setSize(sceneContainer.value.clientWidth, sceneContainer.value.clientHeight)
  sceneContainer.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.screenSpacePanning = false
  controls.maxPolarAngle = Math.PI / 2
  controls.target.copy(initialControlTarget)

  const loader = new GLTFLoader()
  loader.load(
    '/model.glb',
    (gltf) => {
      model = gltf.scene
      const matcapTexture = new THREE.TextureLoader().load('/matcap/normal.png')

      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
          child.material.transparent = true
        }
      })
      model.scale.set(0.01, 0.01, 0.01)
      scene.add(model)
    },
    undefined,
    (error) => {
      console.error('模型加载错误：', error)
    },
  )
}

const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  TWEEN.update() // 更新所有的tween动画
  renderer.render(scene, camera)
}

const onResize = () => {
  // 使用 sceneContainer 的尺寸更新相机的 aspect 和渲染器的大小
  camera.aspect = sceneContainer.value.clientWidth / sceneContainer.value.clientHeight
  camera.updateProjectionMatrix() // 更新相机的投影矩阵
  renderer.setSize(sceneContainer.value.clientWidth, sceneContainer.value.clientHeight) // 更新渲染器尺寸
}

////////////////////////////////////////////////点击事件
let xDown = 0,
  yDown = 0

// -50是为了弥补顶栏上的高度
const setDownTime = (event) => {
  xDown = (event.clientX / sceneContainer.value.clientWidth) * 2 - 1
  yDown = -((event.clientY - 50) / sceneContainer.value.clientHeight) * 2 + 1
}

const onUpdateRay = (event) => {
  const xUp = (event.clientX / sceneContainer.value.clientWidth) * 2 - 1
  const yUp = -((event.clientY - 50) / sceneContainer.value.clientHeight) * 2 + 1
  if (xUp === xDown && yUp === yDown) {
    onMouseClick(event)
  }
}

const onMouseClick = (event) => {
  mouse.x = (event.clientX / sceneContainer.value.clientWidth) * 2 - 1
  mouse.y = -((event.clientY - 50) / sceneContainer.value.clientHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object
    if (currentClickObject.value !== clickedObject.userData.name) {
      controls.enableRotate = false
      controls.enablePan = false
      controls.enableZoom = false

      // 这里判断previousMaterial是否存在，可以作为是否为连续切换的判断
      // 恢复上个点击的建筑贴图
      if (previousMaterial) {
        clickedObject.material.opacity = 1
        previousMaterial.matcap = normalTexture
        // emits('switchBuilding')
      } else {
        // 打开弹窗
        emits('openModal')
      }
      // 将当前建筑更新到previousMaterial
      previousMaterial = clickedObject.material
      const newMatcapTexture = seletedTexture
      if (clickedObject.material instanceof THREE.MeshMatcapMaterial) {
        clickedObject.material.matcap = newMatcapTexture
      }

      // 改状态标识的
      currentClickObject.value = clickedObject.userData.name
      // 动画
      const position = cameraPositions[currentClickObject.value].position || initialCameraPosition
      const target = cameraPositions[currentClickObject.value].target || initialCameraPosition
      new TWEEN.Tween(camera.position)
        .to(position, 1000) // 动画持续 1 秒
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
      new TWEEN.Tween(controls.target).to(target, 1000).easing(TWEEN.Easing.Quadratic.InOut).start()
      // 透明度动画
      model.traverse((child) => {
        if (child.name !== currentClickObject.value && child.isMesh) {
          new TWEEN.Tween(child.material)
            .to({ opacity: 0.5 }, 500) // 动画持续时间为 1 秒
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
        }
      })
      emits('getInfoToUpdate', currentClickObject.value)
    }
  } else {
    exitViewBuilding()
    emits('closeModalOnly')
    // 恢复控制器
    controls.enableRotate = true
    controls.enablePan = true
    controls.enableZoom = true
  }
}

const exitViewBuilding = () => {
  currentClickObject.value = null
  // 改回材质为普通材质，透明度恢复
  if (previousMaterial) {
    previousMaterial.matcap = normalTexture
    previousMaterial = null
  }
  // 动画
  model.traverse((child) => {
    if (child.name !== currentClickObject.value && child.isMesh) {
      new TWEEN.Tween(child.material)
        .to({ opacity: 1 }, 500) // 动画持续时间为 1 秒
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
    }
  })
  if (!currentClickObject.value) {
    new TWEEN.Tween(camera.position)
      .to(initialCameraPosition, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()
    // 同时恢复相机的观察目标
    new TWEEN.Tween(controls.target)
      .to(initialControlTarget, 1000) // 假设你希望目标恢复为原点
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()
  }
}

const enterTopoView = () => {
  new TWEEN.Tween(camera.position)
    .to(topoPreviewCameraPosition, 1000) // 动画持续 1 秒
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
  new TWEEN.Tween(controls.target)
    .to(topoPreviewControlTarget, 1000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
}
const leaveTopoView = () => {
  new TWEEN.Tween(camera.position)
    .to(initialCameraPosition, 1000) // 动画持续 1 秒
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
  new TWEEN.Tween(controls.target)
    .to(initialControlTarget, 1000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
}
const highLightTopo = (buildingName: string) => {
  model.traverse((child) => {
    if (child.isMesh)
      if (child.name === buildingName) {
        child.material.matcap = seletedTexture
      } else {
        child.material.matcap = normalTexture
      }
  })
}
const quitHighLightTopo = () => {
  model.traverse((child) => {
    if (child.isMesh) child.material.matcap = normalTexture
  })
}

defineExpose({
  exitViewBuilding,
  currentClickObject,
  enterTopoView,
  leaveTopoView,
  highLightTopo,
  quitHighLightTopo,
})
// Vue生命周期钩子
onMounted(() => {
  initThreeJS()
  animate()
  window.addEventListener('resize', onResize)
  sceneContainer.value.addEventListener('mousedown', setDownTime)
  sceneContainer.value.addEventListener('mouseup', onUpdateRay)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  sceneContainer.value.removeEventListener('mousedown', setDownTime)
  sceneContainer.value.removeEventListener('mouseup', onUpdateRay)
  controls.dispose()
  renderer.dispose()
})
// 打印当前相机位置的调试按钮
const logCameraPosition = () => {
  console.log(`ps:${camera.position.x}, ${camera.position.y}, ${camera.position.z}`)
  console.log(`ta:${controls.target.x}, ${controls.target.y}, ${controls.target.z}`)
}

const logCameraPosition1 = () => {
  new TWEEN.Tween(camera.position)
    .to(initialCameraPosition, 1000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()

  // 同时恢复相机的观察目标
  new TWEEN.Tween(controls.target)
    .to(initialControlTarget, 1000) // 假设你希望目标恢复为原点
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
}

// 记录相机的初始位置
const initialCameraPosition = new THREE.Vector3(
  29.290220800069466,
  14.061901117329162,
  50.88461172337492,
)
const initialControlTarget = new THREE.Vector3(
  -10.512317143425424,
  1.2875717440579088e-17,
  -6.3301983709749825,
)
const topoPreviewCameraPosition = new THREE.Vector3(
  38.31714849431559,
  14.061901117329148,
  45.02112573770271,
)
const topoPreviewControlTarget = new THREE.Vector3(
  -1.4853894491792674,
  2.1132851890142737e-16,
  -12.19368435664707,
)
// 存储所有模型的最佳观看相机位置
const cameraPositions = {
  tower: {
    position: new THREE.Vector3(15.879922603011886, 10.163481525669615, 19.39931404741177),
    target: new THREE.Vector3(-3.1962915582019553, -1.4465938941225592e-17, -4.535952482290368),
  },
  administrativeBuilding: {
    position: new THREE.Vector3(24.05139872356486, 12.43366885664733, 27.10497345560801),
    target: new THREE.Vector3(-8.613353868460681, -1.5887553602422143e-17, -13.88007054737923),
  },
  dormitory: {
    position: new THREE.Vector3(18.227544635182777, 10.163481525669612, 27.477940752912286),
    target: new THREE.Vector3(-0.8486695242187062, 1.221535215036328e-16, 3.542674220989739),
  },
  plant: {
    position: new THREE.Vector3(22.31031628814229, 9.655307449386088, 27.000249545093816),
    target: new THREE.Vector3(4.187913078825693, 1.294843370186319e-16, 4.2617461468040165),
  },
  lowRiseBuilding: {
    position: new THREE.Vector3(23.670618230600777, 8.278219224417386, 24.831412866602868),
    target: new THREE.Vector3(8.13292277901299, 9.991347295488589e-17, 5.335988515494173),
  },
  officeBuilding: {
    position: new THREE.Vector3(22.954963853698647, 9.62093594446112, 21.757264291360073),
    target: new THREE.Vector3(-2.320399030164405, 1.811386917307477e-17, -9.956181480750102),
  },
  ringBuilding: {
    position: new THREE.Vector3(22.2445024308077, 11.053483905744203, 24.771303848061052),
    target: new THREE.Vector3(5.324517995992841, 7.761821723033515e-17, -0.360944510692525),
  },
  informationCenter: {
    position: new THREE.Vector3(25.163059953725085, 7.6097666550737175, 18.735235164868627),
    target: new THREE.Vector3(1.7851762234990622, 8.231171887264123e-17, -9.733778478096704),
  },
  theSideTower: {
    position: new THREE.Vector3(22.15157062870511, 5.3141838698085575, 12.825798673556877),
    target: new THREE.Vector3(5.825922516145008, 1.2180495047811696e-16, -7.055175336327599),
  },
  warehouse1: {
    position: new THREE.Vector3(8.15256466050368, 17.77166842908798, 17.709478635921666),
    target: new THREE.Vector3(-9.228478008923142, 1.584674569208598e-16, -2.8371133993798776),
  },
  warehouse2: {
    position: new THREE.Vector3(9.898371428958574, 17.77166842908798, 17.93928781085054),
    target: new THREE.Vector3(-7.482671240468248, 9.819845558214531e-17, -2.6073042244510027),
  },
  warehouse3: {
    position: new THREE.Vector3(11.252826976619101, 17.77166842908798, 17.70263338351722),
    target: new THREE.Vector3(-6.128215692807721, 3.2310851042092333e-17, -2.8439586517843236),
  },
  warehouse4: {
    position: new THREE.Vector3(12.654365818008463, 17.77166842908798, 17.315025342689744),
    target: new THREE.Vector3(-4.726676851418359, -4.098420367277357e-17, -3.231566692611799),
  },
  bungalow4: {
    position: new THREE.Vector3(0.1479874197948572, 8.666798653503822, 12.781252602680741),
    target: new THREE.Vector3(-8.328311460188694, 1.8276360789746143e-16, 2.7611936735660225),
  },
  bungalow3: {
    position: new THREE.Vector3(0.9671626648840093, 8.666798653503822, 12.597382753063332),
    target: new THREE.Vector3(-7.5091362150995415, 1.6210883898202334e-16, 2.577323823948615),
  },
  bungalow2: {
    position: new THREE.Vector3(1.6529758156144938, 8.666798653503822, 12.51590787007425),
    target: new THREE.Vector3(-6.823323064369057, 1.4611559271796754e-16, 2.495848940959531),
  },
  bungalow1: {
    position: new THREE.Vector3(2.505424796231064, 8.666798653503822, 12.691638029221345),
    target: new THREE.Vector3(-5.970874083752487, 1.3120184332010993e-16, 2.6715791001066274),
  },
}
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: calc(100vh - var(--menu-height));
}
</style>
