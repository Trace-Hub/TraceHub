"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import type { EventStats } from "@/entities/event/model/eventStats";
import {
  calcChangeRate,
  getPeakLabel,
} from "@/entities/event/model/eventStatsUtils";
import { getEventLabel } from "@/shared/config/eventLabel";
import ChangeRateBadge from "@/shared/ui/ChangeRateBadge";
import InsightLabel from "@/shared/ui/InsightLabel";
import DropIcon from "@/shared/ui/icons/DropIcon";
import LiftIcon from "@/shared/ui/icons/LiftIcon";
import LinkIcon from "@/shared/ui/icons/LinkIcon";

interface EventTopCardProps {
  event: EventStats;
}

const EventTopCard = ({ event }: EventTopCardProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const label = getEventLabel(event.event);
  const changeRate = calcChangeRate(event.currentTotal, event.previousTotal);
  const peakLabel = getPeakLabel(event.breakdown);

  const handleCardClick = (): void => {
    router.push(`/dashboard/events/${encodeURIComponent(event.event)}`);
  };

  return (
    <div className="rounded-xl border border-border-base bg-bg-base overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={handleCardClick}
        className="w-full p-4 flex flex-col gap-2 text-left hover:bg-bg-hover transition-colors flex-1 min-h-30"
      >
        <div className="flex items-center justify-between">
          <p className="text-body2 font-medium text-text-primary">{label}</p>
          <ChangeRateBadge value={changeRate} />
        </div>
        <p className="text-caption text-text-tertiary">{event.event}</p>
        <p className="text-caption text-text-secondary">
          발생:{" "}
          <span className="font-medium">
            {event.currentTotal.toLocaleString()}회
          </span>
          {" · "}이전:{" "}
          <span className="font-medium">
            {event.previousTotal.toLocaleString()}회
          </span>
          {" · "}피크: <span className="font-medium">{peakLabel}</span>
        </p>
      </button>

      {isOpen && (
        <div className="px-4 pb-3 flex flex-col gap-2">
          <InsightLabel
            variant="fact"
            text={`${label} 이벤트가 ${event.currentTotal.toLocaleString()}회 발생했습니다.`}
          />
          <InsightLabel
            variant="comparison"
            text={`이전 기간 대비 ${changeRate > 0 ? "증가" : changeRate < 0 ? "감소" : "동일"}했습니다.`}
          />
          <InsightLabel
            variant="action"
            text="이벤트 추이를 확인하고 비정상 패턴이 있는지 점검하세요."
          />
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1 text-caption text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {isOpen ? (
            <LiftIcon color="var(--color-text-tertiary)" />
          ) : (
            <DropIcon color="var(--color-text-tertiary)" />
          )}
          <span>{isOpen ? "해석 숨기기" : "해석 보기"}</span>
        </button>
        <a
          href={`https://us.posthog.com/project/${process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID}/events?eventType=${encodeURIComponent(event.event)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-caption text-text-tertiary hover:text-text-secondary"
        >
          PostHog에서 보기
          <LinkIcon color="currentColor" />
        </a>
      </div>
    </div>
  );
};

export default EventTopCard;
