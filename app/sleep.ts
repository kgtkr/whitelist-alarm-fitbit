import { Accelerometer } from "accelerometer";

export class Sleep {
  accel: any = null;
  constructor(public onSleep: () => void) {}

  start() {
    /*
    intervalSecond秒に一回batch個の値を取り加速度の大きさの平均aveを取る
    aveがsleepThresholdより小さければ睡眠判定をしコールバックを呼び出す
    ただしaveがactiveThresholdより大きければそこからactiveSkipSecond秒間はコールバックを呼び出さない
    */
    const frequency = 10;
    const batch = 100;
    // 判定する間隔[秒]
    const intervalSecond = batch / frequency;
    // これより小さければ寝ている
    const sleepThreshold = 0.1;
    // これより大きければ活発
    const activeThreshold = 0.5;
    // 活発なときに判定をスキップする時間[秒]
    const activeSkipSecond = 60 * 10;
    // 判定をスキップするフレーム数
    const activeSkipFrame = activeSkipSecond / intervalSecond;

    // これが0ならば判定する
    let skipCount = 0;

    if (Accelerometer) {
      this.accel = new Accelerometer({ frequency, batch });
      this.accel.addEventListener("reading", () => {
        skipCount = Math.max(0, skipCount - 1);
        let sum = 0;
        for (
          let index = 0;
          index < this.accel.readings.timestamp.length;
          index++
        ) {
          sum += accel_size(
            this.accel.readings.x[index],
            this.accel.readings.y[index],
            this.accel.readings.z[index]
          );
        }
        const ave = sum / this.accel.readings.timestamp.length;
        console.log(ave);
        if (ave > activeThreshold) {
          skipCount = activeSkipFrame;
        }
        if (skipCount === 0 && ave < sleepThreshold) {
          this.onSleep();
        }
      });
      this.accel.start();
    } else {
      console.error("Device not compatible with accelerometer");
    }
  }
}

function accel_size(x: number, y: number, z: number) {
  const GRAVITY = 9.8;

  return Math.abs(Math.sqrt(x ** 2 + y ** 2 + z ** 2) - GRAVITY);
}
