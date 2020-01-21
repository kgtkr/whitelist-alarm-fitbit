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
import addMinutes from "date-fns/addMinutes";

me.appTimeoutEnabled = false;

class App {
  page: "main" | "clock-setting" | "exit" = "main";
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
  exitEl = document.getElementById("exit");
  exitCancel = document.getElementById("exit-cancel");
  sleep: Sleep | null = null;
  clickCount = 0;
  constructor() {}

  updatePage() {
    if (this.page === "main") {
      this.clockSettingEl.style.display = "none";
      this.mainEl.style.display = "inline";
      this.exitEl.style.display = "none";
    }

    if (this.page === "clock-setting") {
      this.clockSettingEl.style.display = "inline";
      this.mainEl.style.display = "none";
      this.exitEl.style.display = "none";
    }

    if (this.page === "exit") {
      this.clockSettingEl.style.display = "none";
      this.mainEl.style.display = "none";
      this.exitEl.style.display = "inline";
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
        if (this.page === "main") {
          this.page = "exit";
          this.updatePage();
          evt.preventDefault();
        } else if (this.page === "clock-setting") {
          this.page = "main";
          this.updatePage();
          evt.preventDefault();
        } else if (this.page === "exit") {
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
      }
    };

    this.exitCancel.onactivate = () => {
      this.page = "main";
      this.updatePage();
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
        const date = addMinutes(new Date(), 30);
        this.hourSettingEl.value = getHours(date);
        this.minuteSettingEl.value = Math.floor(getMinutes(date) / 5);
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
