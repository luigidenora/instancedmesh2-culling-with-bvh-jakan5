import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, BufferGeometry, BufferGeometryLoader, Group, Material, Mesh, MeshNormalMaterial, Scene, Vector3 } from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { InstancedMesh2 } from './InstancedMesh2';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { vec3 } from 'three/examples/jsm/nodes/shadernode/ShaderNode';

const main = new Main({ rendererParameters: { antialias: true } }); // init renderer and other stuff
const scene = new Scene();
const camera = new PerspectiveCameraAuto(70);


const controls = new FlyControls(camera, main.renderer.domElement);
controls.rollSpeed = Math.PI / 100;
controls.movementSpeed = 10;
scene.on('animate', (e) => controls.update(e.delta));

Asset.preload(GLTFLoader, 'albero.glb');

await Asset.preloadAllPending({ onProgress: (e) => console.log(e * 100 + '%'), onError: (e) => console.error(e) });

const gltf = Asset.get<GLTF>('albero.glb');

console.log(gltf);

const group = gltf.scene.children[0] as Group;

const trunk = new InstancedMesh2({
  geometry: (group.children[0] as Mesh).geometry,
  material: (group.children[0] as Mesh).material as Material,
  count: 100000,
  onCreateEntity: (obj, index) => {
    obj.position
      .setZ(Math.random() * 2000 - 1000)
      .setX(Math.random() * 2000 - 1000)
      .setY(-50);
    obj.rotateOnAxis(new Vector3(0,1,0),Math.random() * 360)
  },
});
const leaves = new InstancedMesh2({
  geometry: (group.children[1] as Mesh).geometry,
  material: (group.children[1] as Mesh).material as Material,
  count: 100000,
  onCreateEntity: (obj, index) => {
    obj.position.copy(trunk.instances[index].position);
    obj.quaternion.copy(trunk.instances[index].quaternion);

  },
});

scene.add(trunk, leaves, new AmbientLight(undefined, 1));

main.createView({
  scene,
  camera,
  enabled: false,
  backgroundColor: 'white',
  onBeforeRender: () => {
    camera.updateMatrixWorld(true);
    trunk.updateCulling(camera);
    leaves.updateCulling(camera);
  },
});
