import dayjs from "@/shared/lib/dayjs";
import type {
  ErrorStatPoint,
  SentryIssue,
} from "@/entities/error/model/errorStats";

const getYAxisTicks = (max: number): number[] => {
  if (max === 0) return [0, 5, 10, 15, 20];
  const step = Math.ceil(max / 4);
  return [0, step, step * 2, step * 3, step * 4];
};

/**
 * 당일 0시~23시 24슬롯을 강제 생성하고 API 데이터를 매핑
 */
const buildDailySlots = (allStats: ErrorStatPoint[]): ErrorStatPoint[] => {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
  );
  const slots: ErrorStatPoint[] = [];

  for (let h = 0; h < 24; h++) {
    const slotTime = new Date(startOfDay.getTime() + h * 3600 * 1000);
    const slotTimestamp = Math.floor(slotTime.getTime() / 1000);
    const match = allStats.find((s) => {
      const sHour = new Date(s.timestamp * 1000).getHours();
      const sDate = new Date(s.timestamp * 1000).toDateString();
      return sHour === h && sDate === now.toDateString();
    });
    slots.push({ timestamp: slotTimestamp, count: match?.count ?? 0 });
  }

  return slots;
};

/**
 * 이슈 통계 요약 포맷팅
 */
const formatIssueSummary = (issue: SentryIssue): string => {
  const firstSeen = dayjs(issue.firstSeen).format("YYYY.MM.DD HH:mm");
  const lastSeen = dayjs(issue.lastSeen).format("YYYY.MM.DD HH:mm");
  const count = Number(issue.count).toLocaleString();
  const userCount = issue.userCount.toLocaleString();

  return `최초: ${firstSeen} · 마지막: ${lastSeen} · 발생: ${count}회 · 영향 사용자: ${userCount}명`;
};

export { getYAxisTicks, buildDailySlots, formatIssueSummary };
