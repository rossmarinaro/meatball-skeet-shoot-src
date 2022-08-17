

export class Shaders {
    private vertexShader(): string
    {
      return  `
      //varying vec3 vUv;
      varying vec3 fragCoord;
      void main()
      {
        vUv = position;
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewPosition;
      }`;
    
    }
    private fragmentShader(): string
    {
      return `
      uniform vec3 colorA;
      uniform vec3 colorB;
      varying vec3 vUv;
      
      void main(){
        gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
      }`;
  
    }
}


//----- shaders
           
    //   let uniforms = {
    //     colorB: {type: 'vec3', value: new THREE.Color(0xff0000)},
    //     colorA: {type: 'vec3', value: new THREE.Color(0xffff00)}
    //   }
    //  this._geometry = new THREE.BoxGeometry(15, 15, 15);
    //  this._material = new THREE.MeshLambertMaterial({color: 0xff0000})
    //   this._shader = new THREE.ShaderMaterial({
    //     uniforms: uniforms,
    //     vertexShader: vertexShader(),
    //     fragmentShader: fragmentShader(),
    //     //blending: THREE.AdditiveBlending,
    //     //depthTest: true,
    //     //depthWrite: false,
    //     //transparent: false,
    //     //vertexColors: true
    // });
    //  const cube = new THREE.Mesh(this._geometry, this._material, /* this._shader */)
    // cube.position.set(0, 5, 0);
    // cube.shape = 'box';
    // this.third.add.existing(cube);
    // this.third.physics.add.existing(cube); 
    // cube.body.setCollisionFlags(2)