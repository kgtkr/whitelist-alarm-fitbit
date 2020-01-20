import { vibration } from "haptics";
import document from "document";
import { me } from "appbit";
import { Sleep } from "./sleep";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import startOfMinute from "date-fns/startOfMinute";
import addDays from "date-fns/addDays";
import getHours from "date-fns/getHours";
import getMinutes from "date-fns/getMinutes";
import "../common/polyfill";
import { formatHHMM } from "../common/date-format";

me.appTimeoutEnabled = false;

class App {
  page: "main" | "clock-setting" = "main";
  allowSleep: Date | null = null;
  isVibration = false;
  stopButtonEl = document.getElementById("stop-button");
  resetButtonEl = document.getElementById("reset-button");
  allowSleepTextEl = document.getElementById("allow-sleep-text");
  mainEl = document.getElementById("main");
  hourSettingEl = document.getElementById("hour-tumbler");
  minuteSettingEl = document.getElementById("minute-tumbler");
  tumblerOkButtonEl = document.getElementById("tumbler-ok-button");
  clockSettingEl = document.getElementById("clock-setting");
  sleep: Sleep | null = null;
  clickCount = 0;
  constructor() {}

  updatePage() {
    if (this.page === "main") {
      this.clockSettingEl.style.display = "none";
      this.mainEl.style.display = "inline";
    }

    if (this.page === "clock-setting") {
      this.clockSettingEl.style.display = "inline";
      this.mainEl.style.display = "none";
    }
  }

  updateAllowSleepTextEl() {
    if (this.allowSleep === null) {
      this.allowSleepTextEl.text = "未設定";
    } else {
      this.allowSleepTextEl.text = formatHHMM(this.allowSleep);
    }
  }

  updateStopButtonEl() {
    if (this.isVibration) {
      this.stopButtonEl.enabled = true;
    } else {
      this.stopButtonEl.enabled = false;
    }
  }

  start() {
    this.updateStopButtonEl();
    this.updateAllowSleepTextEl();
    this.updatePage();

    document.onkeypress = (evt: any) => {
      if (evt.key === "back") {
        this.clickCount += 1;
        const tmp = this.clickCount;
        // 500msクリックされなければリセット
        setTimeout(() => {
          if (this.clickCount === tmp) {
            this.clickCount = 0;
          }
        }, 500);
        if (this.clickCount < 3) {
          evt.preventDefault();
        }
      }
    };

    this.tumblerOkButtonEl.onactivate = () => {
      const now = new Date();
      const hour = this.hourSettingEl.value;
      const minute = this.minuteSettingEl.value * 5;
      const res = startOfMinute(setMinutes(setHours(now, hour), minute));
      this.allowSleep = res > now ? res : addDays(res, 1);
      console.log(this.allowSleep);
      this.page = "main";
      this.updateAllowSleepTextEl();
      this.updatePage();
    };

    this.stopButtonEl.onactivate = () => {
      this.isVibration = false;
      vibration.stop();
      this.updateStopButtonEl();
    };

    this.resetButtonEl.onactivate = () => {
      if (this.allowSleep === null) {
        const now = new Date();
        this.hourSettingEl.value = getHours(now);
        this.minuteSettingEl.value = Math.floor(getMinutes(now) / 5);
        this.page = "clock-setting";
        this.updatePage();
      } else {
        this.allowSleep = null;
        this.updateAllowSleepTextEl();
      }
    };

    this.sleep = new Sleep(() => {
      if (this.allowSleep !== null && this.allowSleep > new Date()) {
        return;
      }

      this.allowSleep = null;
      this.updateAllowSleepTextEl();
      this.isVibration = true;
      vibration.start("alert");
      this.updateStopButtonEl();
    });

    this.sleep.start();
  }
}

new App().start();
