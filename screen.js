import * as THREE from "three";

export default class Screen extends THREE.Mesh {
  constructor(background, offset) {
    super();
    
    this.bezel = 0.5;
    
    this.geometry = new THREE.BoxGeometry(32, 18, 0.5);
    this.plasticMaterial = new THREE.MeshBasicMaterial({
      color: 0x222222,
    });
    
    this.defaultMaterial = this.material = this.plasticMaterial;
    
    const geometry = new THREE.PlaneGeometry(32, 18);
    const material = new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide});
    
    this.display = new THREE.Mesh(geometry, material);
    this.display.position.x = this.position.x;
    this.display.position.y = this.position.y;
    this.display.position.z = this.position.z + 0.3;
    this.add(this.display);
    
    this.loader = new THREE.TextureLoader();
    if(background)
      this.setImagePath(background);
    else 
      this.setImagePath();
    if(offset || offset === 0)
      this.setImageOffset(offset);
  }
  
  setImageOffset(offset) {
    let texture  = null;
    if(this.display.material)
      texture = this.display.material.map;
    if(texture) {
      texture.repeat.x = 0.333;
      texture.offset.x = offset;
    }
  }

  setSize(size) {
    this.size = size;
    this.geometry.dispose();
    this.geometry = new THREE.BoxGeometry(size.width, size.height, 0.5);
    this.display.geometry.dispose();
    this.display.geometry = new THREE.PlaneGeometry(size.width - this.bezel, size.height - this.bezel);
  }
  
  setBezel(size) {
    this.display.geometry.dispose();
    this.display.geometry = new THREE.PlaneGeometry(this.size.width - size, this.size.height - size);
  }  
  
  setImagePath(path) {
    let frontMaterial = this.plasticMaterial;
    if(path)
      frontMaterial = new THREE.MeshBasicMaterial({ map: this.loader.load(path) });
    
    this.display.defaultMaterial = this.display.material = frontMaterial;
  }
}
