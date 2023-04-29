

export class Clock {

    private static formatTimeByMilliseconds (milliseconds: number): string
    {

        const minutes = Number(Math.floor(((milliseconds / 1000) / 60) % 60).toFixed(0)),
              seconds = Number(Math.floor((milliseconds / 1000) % 60).toFixed(0));
        
        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
      
    }
    
    public static decrementTime(scene: any, timeLimit: number): void
    {
        
        scene.timeLeft = Clock.formatTimeByMilliseconds(timeLimit);
        
        scene.time.addEvent({delay: 1000, callback: () => {
            timeLimit -= 1000;
            scene.timeLeft = Clock.formatTimeByMilliseconds(timeLimit);
        }, repeat: -1});
    }
}