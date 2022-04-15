import * as THREE from "three";

export default class Screen extends THREE.Mesh {
  constructor(background) {
    super();

    this.geometry = new THREE.BoxGeometry(32, 18, 0.5);

    const plasticMaterial = new THREE.MeshBasicMaterial({
      color: 0x222222,
    });
    const loader = new THREE.TextureLoader();

    this.materials = [
      plasticMaterial,
      plasticMaterial,
      plasticMaterial,
      plasticMaterial,
      new THREE.MeshBasicMaterial({ map: loader.load(background) }),
      plasticMaterial,
    ];
    this.defaultMaterial = this.materials;
  }
  
  setImageOffset(offset) {
    const texture = this.materials[4].map;
    texture.repeat.x = 0.333;
    texture.offset.x = offset
  }

  setSize(size) {
    this.geometry.dispose();
    this.geometry = new THREE.BoxGeometry(size.width, size.height, 0.5);
  }
}
