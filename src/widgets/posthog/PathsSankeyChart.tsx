"use client";

import type { MouseEvent as ReactMouseEvent, ReactElement } from "react";
import { useMemo, useRef, useState } from "react";
import {
	Sankey,
	type SankeyData,
	type SankeyElementType,
	type SankeyLinkProps,
	type SankeyNodeProps,
} from "recharts";
import type {
	PathFlowsResponse,
	PathNodeStat,
} from "@/entities/event/model/paths";
import { formatPct, splitDuration } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";
import { ChartContainer } from "@/shared/ui/chart";
import EmptyState from "@/shared/ui/EmptyState";

interface PathsSankeyChartProps {
	flows: PathFlowsResponse;
	className?: string;
}

// recharts는 Sankey data.nodes를 any[]로 받아 그대로 payload에 실어주지만, 그 타입 정의
// 자체는 kind/step/path 같은 커스텀 필드를 모른다 — renderNode/renderLink에서 문자열 비교
// 대신 이 필드로 분기하기 위해 실제로 실려오는 형태를 별도로 선언해 단언에 사용한다
interface PathSankeyNodePayload {
	name: string;
	kind: "real" | "other";
	step: number;
	path: string;
}

// ResponsiveContainer가 실제 크기를 측정하기 전 첫 프레임에는 Sankey 레이아웃 계산이
// NaN을 낼 수 있다 — SVG 속성에 그대로 흘려보내면 React가 경고를 띄우므로 0으로 방어한다
const safeNum = (n: number): number => (Number.isFinite(n) ? n : 0);

// 엣지 hover 툴팁용 — 기존 한글 표기("초"/"분") 유지. 분/초 캐리 계산은 splitDuration에 공유
const formatMs = (ms: number): string => {
	if (ms < 1000) return `${Math.round(ms)}ms`;
	const { totalSeconds, minutes, remSeconds } = splitDuration(ms);
	if (totalSeconds < 60) return `${(ms / 1000).toFixed(1)}초`;
	return `${minutes}분 ${remSeconds}초`;
};

// 노드 팝오버의 "Average time from previous step" 행 전용 — PostHog Paths 표기를 따라 영문 단위(s/m)로 표시
const formatDurationShort = (ms: number): string => {
	if (ms < 1000) return `${Math.round(ms)}ms`;
	const { totalSeconds, minutes, remSeconds } = splitDuration(ms);
	if (totalSeconds < 60) return `${totalSeconds}s`;
	return remSeconds > 0 ? `${minutes}m ${remSeconds}s` : `${minutes}m`;
};

// 노드 정체성은 (step, path) 복합키 — 같은 실제 페이지가 여러 컬럼에 각각 나타날 수 있다
const nodeKey = (step: number, path: string): string => `${step}::${path}`;

interface HoveredLink {
	source: string;
	target: string;
	count: number;
	ratio: number;
	avgTimeMs: number;
	x: number;
	y: number;
}

interface NodeRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

// PostHog Paths처럼 노드에 마우스를 올렸을 때만 그 노드 바로 위에 뜨는 상세 카드
const NodeStatCard = ({ node }: { node: PathNodeStat }): ReactElement => {
	const stepLabel = String(node.step).padStart(2, "0");

	if (node.kind === "other") {
		return (
			<div className="flex flex-col gap-2 p-3 rounded-lg border border-border-subtle bg-bg-card shadow-lg text-body2 w-64">
				<div className="flex items-center justify-between gap-2">
					<span className="font-medium text-text-tertiary italic">
						{stepLabel} 기타
					</span>
					<span className="text-text-tertiary">
						{node.occurrences.toLocaleString()}
					</span>
				</div>
				<span className="text-caption text-text-tertiary">
					노출 상위 페이지 외 나머지를 하나로 묶은 그룹입니다
				</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 p-3 rounded-lg border border-border-subtle bg-bg-card shadow-lg text-body2 w-64">
			<div className="flex items-center justify-between gap-2">
				<span className="font-medium text-text-primary truncate">
					{stepLabel} {node.path}
				</span>
				<span className="text-text-tertiary shrink-0">
					{node.occurrences.toLocaleString()}
				</span>
			</div>
			<div className="flex items-center gap-1.5">
				<span aria-hidden className="text-success">
					→
				</span>
				<span className="text-text-secondary">Continuing</span>
				<span className="ml-auto font-medium text-success">
					{node.continuingCount.toLocaleString()}(
					{formatPct(node.continuingRate)})
				</span>
			</div>
			<div className="flex items-center gap-1.5">
				<span aria-hidden className="text-error">
					↘
				</span>
				<span className="text-text-secondary">Dropping off</span>
				<span className="ml-auto font-medium text-error">
					{node.droppingOffCount.toLocaleString()}(
					{formatPct(node.droppingOffRate)})
				</span>
			</div>
			{node.avgTimeFromPreviousStepMs !== null && (
				<div className="flex items-center justify-between">
					<span className="text-text-secondary">
						Average time from previous step
					</span>
					<span className="font-medium text-text-primary">
						{formatDurationShort(node.avgTimeFromPreviousStepMs)}
					</span>
				</div>
			)}
		</div>
	);
};

interface HoveredNode {
	node: PathNodeStat;
	rect: NodeRect;
}

const PathsSankeyChart = ({
	flows,
	className,
}: PathsSankeyChartProps): ReactElement => {
	const [hoveredLink, setHoveredLink] = useState<HoveredLink | null>(null);
	// PostHog Paths와 동일하게: 경로명 + 인원수는 막대 위에 항상 표시하고(renderNode의 <text>),
	// Continuing/Dropping off/Average time 상세 카드는 노드에 마우스를 올렸을 때만 그 노드
	// 위치에 뜬다 — 클릭도, 모든 노드 동시 표시도 아니다
	const [hoveredNode, setHoveredNode] = useState<HoveredNode | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// hover 시 setHoveredNode/setHoveredLink만으로 재렌더링되므로, flows가 그대로면 이 Map/배열들도
	// 재사용해야 한다 — useMemo 없이 매 렌더마다 새로 만들면 마우스가 차트 위를 지나갈 때마다
	// recharts Sankey가 새 객체 참조를 받아 레이아웃을 다시 계산한다
	// recharts Sankey는 노드를 배열 index로 참조하므로 (step, path) → index 매핑이 필요
	const nodeIndex = useMemo(
		() => new Map(flows.nodes.map((n, i) => [nodeKey(n.step, n.path), i])),
		[flows],
	);
	const nodeStatByKey = useMemo(
		() => new Map(flows.nodes.map((n) => [nodeKey(n.step, n.path), n])),
		[flows],
	);
	const edgeByKey = useMemo(
		() =>
			new Map(flows.edges.map((e) => [`${e.step}::${e.source}::${e.target}`, e])),
		[flows],
	);
	const sankeyData: SankeyData = useMemo(
		() => ({
			nodes: flows.nodes.map((n) => ({
				name: n.kind === "other" ? "기타" : n.path,
				kind: n.kind,
				step: n.step,
				path: n.path,
			})),
			links: flows.edges.map((e) => ({
				source: nodeIndex.get(nodeKey(e.step, e.source)) ?? 0,
				target: nodeIndex.get(nodeKey(e.step + 1, e.target)) ?? 0,
				value: e.count,
			})),
		}),
		[flows, nodeIndex],
	);

	if (flows.nodes.length === 0) {
		return (
			<div className={cn("flex h-64 items-center justify-center", className)}>
				<EmptyState message="선택한 기간에 이동 데이터가 없습니다" />
			</div>
		);
	}

	// 다음 단계로 이어진 이동이 전혀 없으면 엣지가 없다 — recharts Sankey는 링크가 하나도
	// 없는 상태를 다루지 못해(depth 계산이 NaN이 됨) 이 경우엔 Step 0 노드 카드만 보여주고
	// 다이어그램은 그리지 않는다. 전체 경로(필터 없음) 모드에서는 Step 0에 여러 사용자의
	// 서로 다른 첫 방문 페이지가 동시에 존재할 수 있어 전부 나열한다
	if (flows.edges.length === 0) {
		return (
			<div className={cn("flex flex-col gap-3", className)}>
				{flows.nodes.map((node) => (
					<NodeStatCard key={nodeKey(node.step, node.path)} node={node} />
				))}
			</div>
		);
	}

	const renderNode = (props: SankeyNodeProps): ReactElement => {
		const x = safeNum(props.x);
		const y = safeNum(props.y);
		const width = safeNum(props.width);
		const height = safeNum(props.height);
		// recharts의 NodeProps.payload 타입은 커스텀 필드를 모르므로 단언 필요 (위 인터페이스 주석 참고)
		const node = props.payload as unknown as PathSankeyNodePayload;
		const isOther = node.kind === "other";
		// Step 0이 시작 지점 — 전체 경로(필터 없음) 모드에서는 여러 노드가 동시에 Step 0일 수 있다
		const isStart = !isOther && node.step === 0;

		const isHovered =
			hoveredNode?.node.step === node.step &&
			hoveredNode.node.path === node.path;

		return (
			<g>
				<rect
					x={x}
					y={y}
					width={width}
					height={Math.max(height, 2)}
					fill={isStart ? "var(--color-primary)" : "var(--color-text-tertiary)"}
					fillOpacity={isOther ? 0.35 : isHovered ? 1 : 0.7}
					strokeDasharray={isOther ? "3 2" : undefined}
				/>
				{/* PostHog Paths처럼 경로명 + 인원수는 항상 막대 위에 표시한다 */}
				<text
					x={x + width / 2}
					y={y - 6}
					textAnchor="middle"
					className={cn("text-label", isOther && "italic")}
					fill={
						isOther ? "var(--color-text-tertiary)" : "var(--color-text-primary)"
					}
				>
					{node.name}
				</text>
			</g>
		);
	};

	const renderLink = (props: SankeyLinkProps): ReactElement => {
		const sourceX = safeNum(props.sourceX);
		const targetX = safeNum(props.targetX);
		const sourceY = safeNum(props.sourceY);
		const targetY = safeNum(props.targetY);
		const sourceControlX = safeNum(props.sourceControlX);
		const targetControlX = safeNum(props.targetControlX);
		const linkWidth = safeNum(props.linkWidth);

		return (
			<path
				d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
				fill="none"
				stroke="var(--color-primary)"
				strokeOpacity={0.25}
				strokeWidth={Math.max(linkWidth, 1)}
				className="cursor-pointer"
			/>
		);
	};

	// Sankey의 onMouseEnter/Leave는 node/link를 하나의 콜백으로 넘기므로,
	// type으로 분기한 뒤에도 TS가 item의 구체 타입을 좁히지 못해 단언이 필요하다
	const handleElementEnter = (
		item: SankeyNodeProps | SankeyLinkProps,
		type: SankeyElementType,
		e: ReactMouseEvent<SVGGraphicsElement>,
	): void => {
		if (type === "node") {
			const node = (item as SankeyNodeProps)
				.payload as unknown as PathSankeyNodePayload;
			const stat = nodeStatByKey.get(nodeKey(node.step, node.path));
			const container = containerRef.current;
			if (!stat || !container) return;
			// recharts가 넘겨주는 x/y 대신, 실제로 마우스가 올라간 DOM 요소의 위치를 직접 읽어
			// 컨테이너 기준 좌표로 변환한다 — margin 처리 방식에 의존하지 않기 위함
			const nodeBox = e.currentTarget.getBoundingClientRect();
			const containerBox = container.getBoundingClientRect();
			setHoveredNode({
				node: stat,
				rect: {
					left: nodeBox.left - containerBox.left,
					top: nodeBox.top - containerBox.top,
					width: nodeBox.width,
					height: nodeBox.height,
				},
			});
			return;
		}

		const { source, target } = (item as SankeyLinkProps).payload;
		const sourceNode = source as unknown as PathSankeyNodePayload;
		const targetNode = target as unknown as PathSankeyNodePayload;
		const edge = edgeByKey.get(
			`${sourceNode.step}::${sourceNode.path}::${targetNode.path}`,
		);
		if (!edge) return;
		setHoveredLink({
			source: sourceNode.name,
			target: targetNode.name,
			count: edge.count,
			ratio: edge.ratio,
			avgTimeMs: edge.avgTimeMs,
			x: e.clientX,
			y: e.clientY,
		});
	};

	const handleElementLeave = (
		_item: SankeyNodeProps | SankeyLinkProps,
		type: SankeyElementType,
	): void => {
		if (type === "link") setHoveredLink(null);
		if (type === "node") setHoveredNode(null);
	};

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			<div ref={containerRef} className="relative">
				<ChartContainer config={{}} className="aspect-auto h-96">
					<Sankey
						data={sankeyData}
						node={renderNode}
						link={renderLink}
						// recharts 기본값(align="justify")은 뒤로 이어지는 이동이 없는 노드(짧게
						// 끝난 여정의 마지막 페이지)를 전부 맨 오른쪽 컬럼으로 강제로 밀어붙인다 —
						// 이 다이어그램은 짧게 끝나는 여정이 흔해서, 실제 step과 무관하게 여러 노드가
						// 마지막 컬럼 하나에 뭉쳐 보이는 문제가 있었다. "left"는 각 노드를 topology상
						// 실제 depth(step)에 그대로 위치시킨다
						align="left"
						nodePadding={24}
						margin={{ top: 24, right: 80, bottom: 8, left: 80 }}
						onMouseEnter={handleElementEnter}
						onMouseLeave={handleElementLeave}
					/>
				</ChartContainer>

				{hoveredNode && (
					<div
						className="absolute z-20 pointer-events-none"
						style={{
							left: hoveredNode.rect.left + hoveredNode.rect.width / 2,
							top: hoveredNode.rect.top - 8,
							transform: "translate(-50%, -100%)",
						}}
					>
						<NodeStatCard node={hoveredNode.node} />
					</div>
				)}
			</div>

			{hoveredLink && (
				<div
					className="fixed z-50 pointer-events-none rounded-md border border-border-subtle bg-bg-overlay px-3 py-2 text-caption text-text-primary shadow-md"
					style={{ left: hoveredLink.x + 12, top: hoveredLink.y + 12 }}
					role="tooltip"
				>
					<div className="font-medium">
						{hoveredLink.source} → {hoveredLink.target}
					</div>
					<div className="text-text-secondary">
						{hoveredLink.count.toLocaleString()}명 이동 (
						{formatPct(hoveredLink.ratio)})
					</div>
					<div className="text-text-secondary">
						평균 소요 {formatMs(hoveredLink.avgTimeMs)}
					</div>
				</div>
			)}
		</div>
	);
};

export default PathsSankeyChart;
