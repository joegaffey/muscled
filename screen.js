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
    
    this.xAspect = xAspect;
    this.yAspect = yAspect;
    
    this.img = this.getDefaultImage();
    
    const dTexture = new THREE.CanvasTexture(this.img);
    const dMaterial = new THREE.MeshBasicMaterial({
      map: dTexture,
    });
    
    const dGeometry = new THREE.PlaneGeometry(this.xAspect, this.yAspect);
    this.display = new THREE.Mesh(dGeometry, dMaterial);
    this.display.position.x = this.position.x;
    this.display.position.y = this.position.y;
    this.display.position.z = this.position.z + 0.3;    
    this.display.material = dMaterial;
    
    this.add(this.display);
       
    this.setImage(background);
    
    this.offset = Screen.OFFSETS[placement];
    if(this.offset || this.offset === 0)
      this.setImageOffset(this.offset);
  }
  
  getDefaultImage() {
    const canvas = document.createElement('canvas');
    canvas.width = this.xAspect * 300;
    canvas.height = this.yAspect * 100;
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#008';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#FFF';
    ctx.font = "30px Arial";
    ctx.fillText("C:\\loading...", 100, 100);
    return canvas;
  }
  
  setImageOffset(offset) {
    let map = null;
    if(this.display.material)
      map = this.display.material.map;
    
    if(map) {
      map.repeat.x = 1 / 3;
      map.offset.x = offset;
      map.center.x = 0.5;
      map.center.y = 0.5;
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
    }
  }

  setSize(size) {
    this.size = size;
    this.xAspect = size.x;
    this.yAspect = size.y;
    this.fov = size.fov;
    this.geometry.dispose();
    this.geometry = new THREE.BoxGeometry(size.width, size.height, 0.5);
    this.display.geometry.dispose();
    this.display.geometry = new THREE.PlaneGeometry(size.width - this.bezel, size.height - this.bezel);
    const tex = this.display.material.map;
    if(tex.image && this.img) {      
      const imgAspect = tex.image.width / tex.image.height;
      const screenAspect = this.xAspect / this.yAspect;
      let fovAdjust = 1;
      if(screenAspect * 3 < imgAspect)
        fovAdjust = screenAspect;
      const yAdjust = imgAspect / screenAspect / 3;
      
      const ctx  = tex.image.getContext('2d');
      ctx.clearRect(0, 0, tex.image.width, tex.image.height);
      const xAdjust = (tex.image.width - (tex.image.width * this.fov)) / 2;
      ctx.drawImage(this.img, 
                    xAdjust + this.xOffset * tex.image.width,
                    0 + this.yOffset * tex.image.height, 
                    tex.image.width * this.fov,
                    tex.image.height * this.fov / yAdjust);
      tex.needsUpdate = true;
    }
  }
  
  setBezel(size) {
    this.bezel = size;
    this.setSize(this.size);
  }  
  
  setFov(size) {
    this.size.fov = size;
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
  
  setImage(path) {    
    this.img = new Image();
    this.img.src = path;
    this.img.crossOrigin = 'anonymous';
    this.img.onload = () => {
      this.setSize(this.size);
    };
  }
}
