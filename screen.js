import * as THREE from "three";

export default class Screen extends THREE.Mesh {
  constructor(background, offset) {
    super();
    this.geometry = new THREE.BoxGeometry(32, 18, 0.5);
    this.plasticMaterial = new THREE.MeshBasicMaterial({
      color: 0x222222,
    });
    this.loader = new THREE.TextureLoader();
    if(background)
      this.setImage(background);
    else 
      this.setImage();
    if(offset || offset === 0)
      this.setImageOffset(offset);
  }
  
  setImageOffset(offset) {
    let texture  = null;
    if(this.materials[4])
      texture = this.materials[4].map;
    if(texture) {
      texture.repeat.x = 0.333;
      texture.offset.x = offset;
    }
  }

  setSize(size) {
    this.geometry.dispose();
    this.geometry = new THREE.BoxGeometry(size.width, size.height, 0.5);
  }
  
  setImage(imgPath) {
    let frontMaterial = this.plasticMaterial;
    if(imgPath)
      frontMaterial = new THREE.MeshBasicMaterial({ map: this.loader.load(imgPath) });
    this.materials = [
      this.plasticMaterial,
      this.plasticMaterial,
      this.plasticMaterial,
      this.plasticMaterial,
      frontMaterial,
      this.plasticMaterial,
    ];
    this.defaultMaterial = this.materials;
  }
}
