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

const props = defineProps({
  notificationCountByLocation: {
    type: Object,
    required: true,
  },
})

const sceneContainer = ref() // 这是挂载Three.js场景的容器
let scene: InstanceType<THREE.Scene>,
  camera: InstanceType<THREE.PerspectiveCamera>,
  renderer: InstanceType<THREE.Scene>,
  controls: InstanceType<OrbitControls>,
  model: InstanceType<THREE.Scene>
const raycaster = new THREE.Raycaster() // 用于射线投射
const mouse = new THREE.Vector2() // 用于存储鼠标的坐标

// 当前点击的物体，null代表现在没有选择物体和不在看建筑
const currentClickObject = ref(null)

// 贴图
const normalTexture = new THREE.TextureLoader().load('/matcap/normal.png')
const seletedTexture = new THREE.TextureLoader().load('/matcap/blue.png')
const errorTexture = new THREE.TextureLoader().load('/matcap/red.png')
const warningTexture = new THREE.TextureLoader().load('/matcap/orange.png')

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
  camera.position.copy(initialCamera.position)

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
  controls.target.copy(initialCamera.target)

  const loader = new GLTFLoader()
  loader.load(
    '/model.glb',
    (gltf) => {
      model = gltf.scene

      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshMatcapMaterial({ matcap: normalTexture })
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
    if (!currentClickObject.value) {
      emits('openModal')
    }
    // 如果点的不是当前建筑
    if (currentClickObject.value !== clickedObject.userData.name) {
      controls.enableRotate = false
      controls.enablePan = false
      controls.enableZoom = false

      // 改状态标识的
      currentClickObject.value = clickedObject.userData.name

      highLightBuilding(currentClickObject.value, 'select', true, true)
      moveLens(currentClickObject.value)
      emits('getInfoToUpdate', currentClickObject.value)
    }
  } else {
    // 等于直接调exitViewBuilding
    emits('closeModalAndExitView')
    // 恢复控制器
    controls.enableRotate = true
    controls.enablePan = true
    controls.enableZoom = true
  }
}

const exitViewBuilding = () => {
  if (currentClickObject.value) {
    quitHighLightBuilding()
    currentClickObject.value = null
  }
  moveLens('init')
}

// 这里改颜色和透明度
const highLightBuilding = (
  buildingName: string,
  type: string,
  isRecoverOther: boolean,
  isTransparentOther: boolean,
) => {
  model.traverse((child) => {
    if (child.isMesh)
      if (child.name === buildingName) {
        // 根据传进来的需求，将点击的建筑变成对应的颜色
        switch (type) {
          case 'error':
            child.material.matcap = errorTexture
            break
          case 'warning':
            child.material.matcap = warningTexture
            break
          case 'select':
            child.material.matcap = seletedTexture
            break
        }
        // 将透明度变回1
        if (child.material.opacity !== 1)
          new TWEEN.Tween(child.material)
            .to({ opacity: 1 }, 1000) // 动画持续时间为 1 秒
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
      } else {
        // 其他建筑的处理
        if (isTransparentOther === true && child.material.opacity === 1)
          new TWEEN.Tween(child.material)
            .to({ opacity: 0.5 }, 500) // 动画持续时间为 1 秒
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
        if (isRecoverOther === true && child.material.matcap !== normalTexture)
          child.material.matcap = normalTexture
      }
  })
}
// 这里恢复颜色和透明度
const quitHighLightBuilding = () => {
  model.traverse((child) => {
    if (child.isMesh) {
      // 根据通知恢复颜色
      if (props.notificationCountByLocation[child.name]) {
        if (props.notificationCountByLocation[child.name].error !== 0) {
          child.material.matcap = errorTexture
        } else if (props.notificationCountByLocation[child.name].warning !== 0) {
          child.material.matcap = warningTexture
        } else {
          child.material.matcap = normalTexture
        }
      } else {
        if (child.material.matcap !== normalTexture) child.material.matcap = normalTexture
      }
      // 恢复透明度
      if (child.material.opacity !== 1) {
        new TWEEN.Tween(child.material)
          .to({ opacity: 1 }, 1000) // 动画持续时间为 1 秒
          .easing(TWEEN.Easing.Quadratic.InOut)
          .start()
      }
    }
  })
}

const enterTopoView = () => {
  moveLens('topo')
}

const leaveTopoView = () => {
  moveLens('init')
}

defineExpose({
  exitViewBuilding,
  currentClickObject,
  enterTopoView,
  leaveTopoView,
  highLightBuilding,
  quitHighLightBuilding,
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

// 移动视角
const moveLens = (target: string) => {
  switch (target) {
    case 'init':
      new TWEEN.Tween(camera.position)
        .to(initialCamera.position, 1000) // 动画持续 1 秒
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
      new TWEEN.Tween(controls.target)
        .to(initialCamera.target, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
      break
    case 'topo':
      new TWEEN.Tween(camera.position)
        .to(topoPreview.position, 1000) // 动画持续 1 秒
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
      new TWEEN.Tween(controls.target)
        .to(topoPreview.target, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
      break
    default:
      new TWEEN.Tween(camera.position)
        .to(cameraPositions[target].position || initialCamera.position, 1000) // 动画持续 1 秒
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
      new TWEEN.Tween(controls.target)
        .to(cameraPositions[target].target || initialCamera.target, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
  }
}
// 记录相机的初始位置
const initialCamera = {
  position: new THREE.Vector3(29.290220800069466, 14.061901117329162, 50.88461172337492),
  target: new THREE.Vector3(-10.512317143425424, 1.2875717440579088e-17, -6.3301983709749825),
}

const topoPreview = {
  position: new THREE.Vector3(38.31714849431559, 14.061901117329148, 45.02112573770271),
  target: new THREE.Vector3(-1.4853894491792674, 2.1132851890142737e-16, -12.19368435664707),
}

// 存储所有模型的最佳观看相机位置
const cameraPositions = {
  tower: {
    position: new THREE.Vector3(25.163059953725085, 7.6097666550737175, 18.735235164868627),
    target: new THREE.Vector3(1.7851762234990622, 8.231171887264123e-17, -9.733778478096704),
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
    position: new THREE.Vector3(15.879922603011886, 10.163481525669615, 19.39931404741177),
    target: new THREE.Vector3(-3.1962915582019553, -1.4465938941225592e-17, -4.535952482290368),
  },
  theSideTower: {
    position: new THREE.Vector3(22.15157062870511, 5.3141838698085575, 12.825798673556877),
    target: new THREE.Vector3(5.825922516145008, 1.2180495047811696e-16, -7.055175336327599),
  },
  warehouse: {
    position: new THREE.Vector3(9.898371428958574, 17.77166842908798, 17.93928781085054),
    target: new THREE.Vector3(-7.482671240468248, 9.819845558214531e-17, -2.6073042244510027),
  },
  bungalow: {
    position: new THREE.Vector3(0.9671626648840093, 8.666798653503822, 12.597382753063332),
    target: new THREE.Vector3(-7.5091362150995415, 1.6210883898202334e-16, 2.577323823948615),
  },
}
// // 打印当前相机位置的调试按钮
// const logCameraPosition = () => {
//   console.log(`ps:${camera.position.x}, ${camera.position.y}, ${camera.position.z}`)
//   console.log(`ta:${controls.target.x}, ${controls.target.y}, ${controls.target.z}`)
// }

// const logCameraPosition1 = () => {
//   new TWEEN.Tween(camera.position)
//     .to(initialCameraPosition, 1000)
//     .easing(TWEEN.Easing.Quadratic.InOut)
//     .start()

//   // 同时恢复相机的观察目标
//   new TWEEN.Tween(controls.target)
//     .to(initialControlTarget, 1000) // 假设你希望目标恢复为原点
//     .easing(TWEEN.Easing.Quadratic.InOut)
//     .start()
// }
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: calc(100vh - var(--menu-height));
}
</style>
