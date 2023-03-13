
import * as ENABLE3D from '@enable3d/phaser-extension';


export class Lighting {

  public scene: ENABLE3D.Scene3D

  constructor(
    scene: ENABLE3D.Scene3D, 
    dirPosX: number, 
    dirPosY: number, 
    ambPosX: number, 
    ambPosY: number,
    dir_light: { color: number, intensity: number },
    amb_light: { color: number, intensity: number }
  )
  {
    this.scene = scene;

    const dirlight = new ENABLE3D.THREE.DirectionalLight(dir_light.color, dir_light.intensity),
          amblight = new ENABLE3D.THREE.AmbientLight(amb_light.color, amb_light.intensity);

    dirlight.position.set(0, dirPosX, dirPosY).normalize();
    dirlight.rotation.set(1, 1, 1);
    amblight.position.set(0, ambPosX, ambPosY).normalize();
    amblight.rotation.set(1, 1, 1);

    this.scene.third.add.existing(dirlight);
    this.scene.third.add.existing(amblight);

    this.scene.events.on('update', ()=> {
      if (amblight)
      {
        let scale = Math.random() * 3;
        amblight.scale.set(scale, scale, scale);
      }
    });
  }
}