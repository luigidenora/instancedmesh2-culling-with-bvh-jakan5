import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { BufferGeometry, BufferGeometryLoader, Group, Mesh, MeshNormalMaterial, Scene } from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { InstancedMesh2 } from './InstancedMesh2';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'; 

const main = new Main({ rendererParameters: { antialias: true } }); // init renderer and other stuff
const scene = new Scene();
const camera = new PerspectiveCameraAuto(70);

const controls = new FlyControls(camera, main.renderer.domElement);
controls.rollSpeed = Math.PI / 100;
controls.movementSpeed = 1;
scene.on('animate', (e) => controls.update(e.delta));

Asset.preload(GLTFLoader, 'albero.glb');

await Asset.preloadAllPending({ onProgress: (e) => console.log(e * 100 + '%'), onError: (e) => console.error(e) });

const gltf = Asset.get<GLTF>('albero.glb');

console.log(gltf)

const monkeys = new InstancedMesh2({
  geometry: (gltf.scene.children[0] as Mesh).geometry,
  material: new MeshNormalMaterial(),
  count: 1000000,
  onCreateEntity: (obj, index) => {
    obj.position.random().multiplyScalar(5000).subScalar(2500);
    obj.quaternion.random();
  },
});

scene.add(monkeys);

main.createView({
  scene,
  camera,
  enabled: false,
  backgroundColor: 'white',
  onBeforeRender: () => {
    camera.updateMatrixWorld(true);
    monkeys.updateCulling(camera);
  },
});
