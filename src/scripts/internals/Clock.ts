
export class Clock {

    private static event: Phaser.Time.TimerEvent

    //----------------------------------

    public static formatTimeByMilliseconds (milliseconds: number): string
    {

        const minutes = Number(Math.floor(((milliseconds / 1000) / 60) % 60).toFixed(0)),
              seconds = Number(Math.floor((milliseconds / 1000) % 60).toFixed(0));
        
        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
      
    }

    //----------------------------------
    
    public static startTimer(scene: any, timeLimit: number, type: string): void
    {

        if (typeof scene.setTime !== 'function')
            return;
         
        scene.setTime(this.formatTimeByMilliseconds(timeLimit));
        
        this.event = scene.time.addEvent({delay: 1000, callback: () => {
            type === 'increment' ? timeLimit += 1000 : timeLimit -= 1000;
            scene.setTime(this.formatTimeByMilliseconds(timeLimit));
        }, repeat: -1});
    }


    //----------------------------------

    public static stopTimer(): void
    {
        if (this.event) {
            this.event.paused = true;
            this.event.remove();
            this.event.destroy();
        }
    }
}