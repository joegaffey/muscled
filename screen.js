import * as THREE from 'three';

export default class Screen extends THREE.Mesh {
  
  static OFFSETS = {
    left: 1/3,
    middle: 0,
    right: -1/3    
  };

  constructor(spec, background, placement) {
    super();
    
    this.spec = spec;
       
    this.geometry = new THREE.BoxGeometry(this.spec.width, this.spec.height, this.spec.depth);
    const plasticMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
    });
    
    this.material = plasticMaterial;
    this.img = this.getLoadingImage();
    
    const dTexture = new THREE.CanvasTexture(this.img);
    const dMaterial = new THREE.MeshBasicMaterial({
      map: dTexture,
      // emmissive: 0xffffff,
      // emmissiveIntensity: 1000,
    });
        
    const dGeometry = new THREE.PlaneGeometry(this.spec.width - this.spec.bezel, this.spec.height - this.spec.bezel);
    this.display = new THREE.Mesh(dGeometry, dMaterial);
    this.display.position.x = this.position.x;
    this.display.position.y = this.position.y;
    this.display.position.z = this.position.z + this.spec.depth + 0.1;
    this.display.material = dMaterial;    
    this.add(this.display);
    
    this.addPoints();
    this.positionPoints();
           
    this.offset = Screen.OFFSETS[placement];
    if(this.offset || this.offset === 0)
      this.setImageOffset(this.offset);
    
    this.setImage(background);
  }
  
  addPoints() {
    this.points = [];
    for(let i = 0; i < 5; i++)
      this.addPoint();
  }
  
  positionPoint(point, x, y) {
    point.geometry = new THREE.SphereGeometry(0.5, 32, 16);
    point.position.x = this.spec.width / 2 * x;
    point.position.y = this.spec.height / 2 * y;
    point.position.z = this.spec.depth + 0.2;
  }
  
  positionPoints() {
    this.positionPoint(this.points[0], 0, 0);
    this.positionPoint(this.points[1], 1, 1);
    this.positionPoint(this.points[2], -1, -1);
    this.positionPoint(this.points[3], 1, -1);
    this.positionPoint(this.points[4], -1, 1);
  }
  
  addPoint() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.isControlPoint = true;
    sphere.visible = false;
    this.add(sphere);
    this.points.push(sphere);
  }
  
  getLoadingImage() {
    const canvas = document.createElement('canvas');
    canvas.width = this.spec.xAspect * 300;
    canvas.height = this.spec.yAspect * 100;
    const ctx = canvas.getContext('2d')
    this.drawLoadingImg(ctx);
    return canvas;
  }
   
  drawLoadingImg(ctx) {
    ctx.fillStyle = '#004';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#AAA';
    ctx.font = '75px Arial';
    const text = 'LOADING...';
    const tm = ctx.measureText(text);
    ctx.fillText(text, ctx.canvas.width / 2 - tm.width / 2, ctx.canvas.height /2);
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

  setSpec(spec) {
    this.spec = spec;
    
    this.geometry.dispose();
    this.geometry = new THREE.BoxGeometry(this.spec.width, this.spec.height, this.spec.depth);
        
    this.display.geometry.dispose();
    this.display.geometry = new THREE.PlaneGeometry(this.spec.width - this.spec.bezel, this.spec.height - this.spec.bezel);
    this.display.position.z = this.spec.depth / 2 + 0.1;
    
    this.positionPoints();
    
    const tex = this.display.material.map;
        
    if(tex.image && this.img) {      
      const imgAspect = tex.image.width / tex.image.height;
      const screenAspect = this.spec.xAspect / this.spec.yAspect;
      let fovAdjust = 1;
      if(screenAspect * 3 < imgAspect)
        fovAdjust = screenAspect;
      const yAdjust = imgAspect / screenAspect / 3;
      const xAdjust = (tex.image.width - (tex.image.width * this.spec.fov)) / 2;
      
      const ctx  = tex.image.getContext('2d');
      ctx.clearRect(0, 0, tex.image.width, tex.image.height);
      ctx.drawImage(this.img, 
                    xAdjust + this.spec.xOffset * tex.image.width,
                    (1 - this.spec.fov / yAdjust) / 2 * tex.image.height + this.spec.yOffset * tex.image.height, 
                    tex.image.width * this.spec.fov,
                    tex.image.height * this.spec.fov / yAdjust);
      
      tex.needsUpdate = true;
    }
  }
  
  setLoading() {
    const tex = this.display.material.map;
    const ctx  = tex.image.getContext('2d');
    this.drawLoadingImg(ctx);
    tex.needsUpdate = true;
  }
  
  setImage(path) {
    this.setLoading();
    this.img = new Image();
    this.img.src = path;
    this.img.crossOrigin = 'anonymous';
    this.img.onload = () => {
      this.setSpec(this.spec);
    };
  }
}