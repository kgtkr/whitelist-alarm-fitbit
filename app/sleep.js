import { Accelerometer } from "accelerometer";

export class Sleep {
  constructor(onSleep) {
    this.onSleep = onSleep;
    this.accel = null;
  }

  start() {
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
  }
}

function accel_size(x, y, z) {
  const GRAVITY = 9.8;

  return Math.abs(
    Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2)) - GRAVITY
  );
}
