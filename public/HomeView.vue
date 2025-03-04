<template>
  <div>
    <div ref="sceneContainer" class="scene-container"></div>
    <button @click="logCameraPosition()" style="position: absolute; top: 20px; left: 20px">
      Log Camera Position
    </button>
    <button @click="logCameraPosition1()" style="position: absolute; top: 20px; left: 180px">
      Log Camera Position1
    </button>
  </div>
</template>

<script>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js' // 用于平滑动画过渡

export default {
  name: 'ThreeScene',
  setup() {
    const sceneContainer = ref(null) // 这是挂载Three.js场景的容器
    let scene, camera, renderer, controls, model
    const raycaster = new THREE.Raycaster() // 用于射线投射
    const mouse = new THREE.Vector2() // 用于存储鼠标的坐标

    // 存储所有模型的最佳观看相机位置
    const cameraPositions = {
      // 添加其他模型的位置
      塔楼: {
        position: new THREE.Vector3(15.879922603011886, 10.163481525669615, 19.39931404741177),
        target: new THREE.Vector3(-3.1962915582019553, -1.4465938941225592e-17, -4.535952482290368)
      }
    }

    // 当前点击的物体
    let currentClickObject = null
    // 保存上一个点击物体的原始贴图
    let previousMaterial = null
    const normalTexture = new THREE.TextureLoader().load('/matcap/normal.png')
    const seletedTexture = new THREE.TextureLoader().load('/matcap/red.png')

    // 记录相机的初始位置
    let initialCameraPosition = new THREE.Vector3()

    // 初始化函数
    const initThreeJS = () => {
      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.x = 39.809069
      camera.position.y = 14.060628
      camera.position.z = 57.210579
      initialCameraPosition.copy(camera.position) // 记录初始位置

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        precision: 'highp'
      })
      renderer.setClearAlpha(0.0)
      renderer.setSize(window.innerWidth, window.innerHeight)
      sceneContainer.value.appendChild(renderer.domElement)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.screenSpacePanning = false
      controls.maxPolarAngle = Math.PI / 2

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
        }
      )
    }

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      TWEEN.update() // 更新所有的tween动画
      renderer.render(scene, camera)
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    ////////////////////////////////////////////////点击事件
    let xDown,
      yDown = 0

    const setDownTime = (event) => {
      xDown = (event.clientX / window.innerWidth) * 2 - 1
      yDown = -(event.clientY / window.innerHeight) * 2 + 1
    }

    const onUpdateRay = (event) => {
      let xUp = (event.clientX / window.innerWidth) * 2 - 1
      let yUp = -(event.clientY / window.innerHeight) * 2 + 1
      if (xUp === xDown && yUp === yDown) {
        onMouseClick(event)
      }
    }

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObjects(scene.children, true)

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object
        if (currentClickObject !== clickedObject.userData.name) {
          controls.enableRotate = false
          controls.enablePan = false
          controls.enableZoom = false

          // 改材质的
          if (previousMaterial) {
            previousMaterial.matcap = normalTexture
          }
          previousMaterial = clickedObject.material
          const newMatcapTexture = seletedTexture
          if (clickedObject.material instanceof THREE.MeshMatcapMaterial) {
            clickedObject.material.matcap = newMatcapTexture
          }

          // 改状态标识的
          currentClickObject = clickedObject.userData.name

          // 动画
          const position = cameraPositions[currentClickObject].position || initialCameraPosition
          const target = cameraPositions[currentClickObject].target || initialCameraPosition
          new TWEEN.Tween(camera.position)
            .to(position, 1000) // 动画持续 1 秒
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
          new TWEEN.Tween(controls.target)
            .to(target, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
          model.traverse((child) => {
            if (child.name !== currentClickObject && child.isMesh) {
              new TWEEN.Tween(child.material)
                .to({ opacity: 0.5 }, 1000) // 动画持续时间为 1 秒
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start()
            }
          })
        }
      } else {
        // 改回材质
        if (previousMaterial) {
          previousMaterial.matcap = normalTexture
        }
        currentClickObject = null

        // 动画
        model.traverse((child) => {
          if (child.name !== currentClickObject && child.isMesh) {
            new TWEEN.Tween(child.material)
              .to({ opacity: 1 }, 1000) // 动画持续时间为 1 秒
              .easing(TWEEN.Easing.Quadratic.InOut)
              .start()
          }
        })
        if (!currentClickObject) {
          new TWEEN.Tween(camera.position)
            .to(initialCameraPosition, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
        }

        // 恢复控制器
        controls.enableRotate = true
        controls.enablePan = true
        controls.enableZoom = true
      }
    }

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
      console.log('Camera Position:', camera.position)
      console.log('targe：', controls.target)
    }

    const logCameraPosition1 = () => {
      new TWEEN.Tween(camera.position)
        .to(initialCameraPosition, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()

      // 同时恢复相机的观察目标
      new TWEEN.Tween(controls.target)
        .to(new THREE.Vector3(0, 0, 0), 1000) // 假设你希望目标恢复为原点
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
    }
    return { sceneContainer, logCameraPosition, logCameraPosition1 }
  }
}
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  background-image: linear-gradient(rgb(222, 222, 222), rgb(255, 255, 255));
}
</style>
