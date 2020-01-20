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

me.appTimeoutEnabled = false;

function padStart(s, targetLength, padString) {
  while (s.length < targetLength) {
    s = padString + s;
  }
  return s;
}

class App {
  constructor() {
    this.page = "main";
    this.allowSleep = null;
    this.isVibration = false;
    this.stopButtonEl = document.getElementById("stop-button");
    this.resetButtonEl = document.getElementById("reset-button");
    this.allowSleepTextEl = document.getElementById("allow-sleep-text");
    this.mainEl = document.getElementById("main");
    this.hourSettingEl = document.getElementById("hour-tumbler");
    this.minuteSettingEl = document.getElementById("minute-tumbler");
    this.tumblerOkButtonEl = document.getElementById("tumbler-ok-button");
    this.clockSettingEl = document.getElementById("clock-setting");
    this.sleep = null;
  }

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
      this.allowSleepTextEl.text =
        padStart(String(getHours(this.allowSleep)), 2, "0") +
        ":" +
        padStart(String(getMinutes(this.allowSleep)), 2, "0");
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
