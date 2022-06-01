import * as THREE from "three";

export default class Screen extends THREE.Mesh {
  
  static OFFSETS = {
    left: 1/3,
    middle: 0,
    right: -1/3    
  };

  constructor(xAspect, yAspect, background, placement) {
    super();
    
    this.bezel = 0.5;
    this.fov = 1;
    this.xOffset = 0;
    this.yOffset = 0;
    
    this.geometry = new THREE.BoxGeometry(xAspect, yAspect, 0.5);
    this.plasticMaterial = new THREE.MeshBasicMaterial({
      color: 0x222222,
    });
    
    this.defaultMaterial = this.material = this.plasticMaterial;
    
    this.width = xAspect;
    this.height = yAspect;
    
    const geometry = new THREE.PlaneGeometry(this.width, this.height);
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
    
    this.offset = Screen.OFFSETS[placement];
    if(this.offset || this.offset === 0)
      this.setImageOffset(this.offset);
  }
  
  setImageOffset(offset) {
    let texture  = null;
    if(this.display.material)
      texture = this.display.material.map;
    
    if(texture) {
      texture.repeat.x = 1 / 3;
      texture.offset.x = offset;
      texture.center.x = 0.5;
      texture.center.y = 0.5;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }
  }

  setSize(size) {
    this.width = size.x;
    this.height = size.y;
    this.size = size;
    this.geometry.dispose();
    this.geometry = new THREE.BoxGeometry(size.width, size.height, 0.5);
    this.display.geometry.dispose();
    this.display.geometry = new THREE.PlaneGeometry(size.width - this.bezel, size.height - this.bezel);
    const tex = this.display.material.map;
    if(tex.image) {      
      const imgAspect = tex.image.width / tex.image.height;
      const screenAspect = this.width / this.height;
      let fovAdjust = 1;
      if(screenAspect * 3 < imgAspect)
        fovAdjust = screenAspect;
      const yAdjust = imgAspect / screenAspect / 3;
      tex.repeat.y = yAdjust * this.fov / fovAdjust;
      tex.repeat.x = this.fov / 3 / fovAdjust;
      tex.offset.x = (this.offset * this.fov / fovAdjust) + this.xOffset;
      tex.offset.y = this.yOffset;
    }
  }
  
  setBezel(size) {
    this.display.geometry.dispose();
    this.display.geometry = new THREE.PlaneGeometry(this.size.width - size, this.size.height - size);
  }  
  
  setFov(size) {
    this.fov = size;
    this.setSize(this.size);
  }
  
  setXOffset(size) {
    this.xOffset = size;
    this.setSize(this.size);
  }
  
  setYOffset(size) {
    this.yOffset = size;
    this.setSize(this.size);
  }
  
  setImagePath(path) {
    let frontMaterial = this.plasticMaterial;
    if(path) {      
      frontMaterial = new THREE.MeshBasicMaterial({ map: this.loader.load(path) });
    }    
    this.display.defaultMaterial = this.display.material = frontMaterial;
  }
}
