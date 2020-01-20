import getHours from "date-fns/getHours";
import getMinutes from "date-fns/getMinutes";

export function formatHHMM(date: Date): string {
  return (
    String(getHours(date)).padStart(2, "0") +
    ":" +
    String(getMinutes(date)).padStart(2, "0")
  );
}
