import * as ENABLE3D from '@enable3d/phaser-extension'

export class Particles3D  { 

    public material: ENABLE3D.THREE.PointsMaterial
    public particlesGeometry: ENABLE3D.THREE.BufferGeometry
    public particles: ENABLE3D.THREE.Points

    constructor(
      scene: ENABLE3D.Scene3D, 
      color: number, 
      limit: number, 
      x: number = 0, 
      y: number = 0, 
      z: number = 0,
      opacity: number = 1,
      size: number = 1,
      scale: { x: number, y: number, z: number } = { x: 1, y: 1, z: 1 } 
    ) 
    {
        const positions = new Float32Array(limit * 3); // 3 values (x, y, z) per particle
          
        // Fill the positions array with random coordinates
        for (let i = 0; i < limit * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 10; // x position
            positions[i + 1] = (Math.random() - 0.5) * 10; // y position
            positions[i + 2] = (Math.random() - 0.5) * 10; // z position
        }
         
        // 1. Create the geometry and set the position attribute
        this.particlesGeometry = new ENABLE3D.THREE.BufferGeometry();
        this.particlesGeometry.setAttribute('position', new ENABLE3D.THREE.BufferAttribute(positions, 3));
        
        // 2. Create the material
        this.material = new ENABLE3D.THREE.PointsMaterial({
            size, // Particle size
            sizeAttenuation: true, // Particles get smaller as they move away from the camera
            color, 
            transparent: opacity < 1,
            opacity,
            depthWrite: false, // Helps with transparency blending issues
            blending: ENABLE3D.THREE.AdditiveBlending, // Makes particles appear brighter when overlapping
        });
        
        // Optional: Use a texture for custom particle shapes (e.g., a soft circle/sprite)
        // const textureLoader = new THREE.TextureLoader();
        // const particleTexture = textureLoader.load('path/to/your/particle_sprite.png');
        // particlesMaterial.map = particleTexture;
        
        // 3. Create the Points object and add it to the scene
        this.particles = new ENABLE3D.THREE.Points(this.particlesGeometry, this.material);
        this.particles.scale.set(scale.x, scale.y, scale.z);
        this.particles.position.set(x, y, z);   

        scene.third.add.existing(this.particles);
    }
}


