

//------------------------ config

export type orientation = {
    on: (event: string, callback: any, state: any) => void
    off: (event: string, callback: any, state: any) => void
    lock: (aspectRatio: OrientationLockType) => void
    unlock: () => void
}
export type ammo = {
    automac1000: number
    penne_pistol: number
    rigatoni_rocket_launcher: number
    grenade: number
    dynamite: number
} 

export type parent = string
export type backgroundColor = string

export type date = Date
export type hours = number 
export type timeOfDay = number
export type timeWarp = number 
export type type = number

export type shaders = any
export type pipeline = any[]

export type transparent = boolean
export type pixelArt = boolean
export type dom = { createContainer: boolean }

export type scene = Phaser.Scene[]

export type input = {
    virtual: boolean
    gamepad: boolean
    type: string
    mode: string
}
export type physics = any
export type scale = any


export type isPreloaded = {
    //ui: false,
    BassUI: boolean
}

export type multiPlayer = {
    key: string
    isPlaying: false
    attackBool: false
    chat: false
    username: null
}

 
export type account = {
    username: string
    loggedIn: boolean
    paid: boolean
}

export type joystick = {
    A: {
      self: any | null
      base?: Phaser.GameObjects.Arc | null
      thumb?: Phaser.GameObjects.Arc
    }
  }