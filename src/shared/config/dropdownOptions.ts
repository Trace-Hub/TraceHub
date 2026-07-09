import type { DropdownOption } from "@/shared/ui/Dropdown";
import type { ErrorStatsPeriod } from "@/entities/error/model/errorStats";
import type { Period } from "@/shared/ui/PeriodTab";

type EnvFilterValue = "production" | "development";

const ENV_OPTIONS: DropdownOption<EnvFilterValue>[] = [
  { value: "development", label: "Development" },
  { value: "production", label: "Production" },
];

/** PeriodTab("오늘"|"7일"|"30일") → ErrorStatsPeriod("24h"|"7d"|"30d") 변환 맵 */
const PERIOD_TAB_MAP: Record<Period, ErrorStatsPeriod> = {
  오늘: "24h",
  "7일": "7d",
  "30일": "30d",
};

export type { EnvFilterValue };
export { ENV_OPTIONS, PERIOD_TAB_MAP };
