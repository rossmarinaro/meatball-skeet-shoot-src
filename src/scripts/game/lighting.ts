import * as ENABLE3D from '@enable3d/phaser-extension'

export class Lighting {

  private static stageLighting: {
    directional: ENABLE3D.THREE.DirectionalLight | null
    ambient: ENABLE3D.THREE.AmbientLight | null
  } = {
    directional: null,
    ambient: null
  }

  public static init (
    scene: ENABLE3D.Scene3D, 
    dirPos: ENABLE3D.THREE.Vector3,  
    ambPos: ENABLE3D.THREE.Vector3, 
    dir_light: { color: number, intensity: number },
    amb_light: { color: number, intensity: number }
  )
  {

    Lighting.stageLighting.directional = new ENABLE3D.THREE.DirectionalLight(dir_light.color, dir_light.intensity);
    Lighting.stageLighting.ambient = new ENABLE3D.THREE.AmbientLight(amb_light.color, amb_light.intensity);

    Lighting.stageLighting.directional.position.set(dirPos.x, dirPos.y, dirPos.z).normalize();
    Lighting.stageLighting.directional.rotation.set(1, 1, 1);

    Lighting.stageLighting.directional.castShadow = true;
    Lighting.stageLighting.directional.shadow.bias = -0.001;
    Lighting.stageLighting.directional.shadow.mapSize.width = 5048;
    Lighting.stageLighting.directional.shadow.mapSize.height = 350;
    Lighting.stageLighting.directional.shadow.camera.near = 500;
    Lighting.stageLighting.directional.shadow.camera.far = 500;
    Lighting.stageLighting.directional.shadow.camera.left = 5000;
    Lighting.stageLighting.directional.shadow.camera.right = -5000;
    Lighting.stageLighting.directional.shadow.camera.top = 5000;
    Lighting.stageLighting.directional.shadow.camera.bottom = 500;

    Lighting.stageLighting.ambient.position.set(ambPos.x, ambPos.y, ambPos.z).normalize();
    Lighting.stageLighting.ambient.rotation.set(1, 1, 1);

    scene.third.add.existing(Lighting.stageLighting.directional);
    scene.third.add.existing(Lighting.stageLighting.ambient);
  }


  //----------------------- set dir light pos


  public static setDirectionalLight(position: ENABLE3D.THREE.Vector3): void {
    this.stageLighting.directional?.position.set(position.x, position.y, position.z);
    this.stageLighting.directional?.target.position.set(0, 0, 0);
  }


  //------------------------- set creepy


  public static setCreepyLighting(scene: ENABLE3D.Scene3D, posY?: number): void
  {
    const player = scene['player'];

    posY = posY ? posY : player && player.position.y - 10;

    if (posY)
        this.setDirectionalLight(new ENABLE3D.THREE.Vector3(player ? player.x : 0, posY, player ? player.z : 0));
  }
}

