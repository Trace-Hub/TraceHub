import type { DropdownOption } from "@/shared/ui/Dropdown";

type EnvFilterValue = "production" | "development";

const ENV_OPTIONS: DropdownOption<EnvFilterValue>[] = [
  { value: "development", label: "Development" },
  { value: "production", label: "Production" },
];

export type { EnvFilterValue };
export { ENV_OPTIONS };
