'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
// Simple Card component replacements
import { useConversationFlow } from '@/app/_hooks/analytics/useAnalytics';

interface ConversationFlowChartProps {
  widgetId: string;
  dateRange: { start: Date; end: Date };
}

interface SankeyNode {
  id: number;
  label: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyNodeWithCoords extends SankeyNode {
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  value?: number;
}

interface SankeyLinkWithCoords extends SankeyLink {
  width?: number;
  source: any;
  target: any;
}

export function ConversationFlowChart({ widgetId, dateRange }: ConversationFlowChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, isLoading, isError } = useConversationFlow(widgetId, dateRange);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Clear previous chart
    svg.selectAll('*').remove();

    // Create Sankey generator
    const sankeyGenerator = sankey<
      { id: number; label: string },
      { source: string; target: string; value: number }
    >()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    // Prepare data
    const sankeyData = {
      nodes: data.nodes.map((d: SankeyNode) => ({ ...d })),
      links: data.links.map((d: SankeyLink) => ({ ...d })),
    };

    // Generate Sankey diagram
    const { nodes, links } = sankeyGenerator(sankeyData);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Add links
    svg
      .append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d: SankeyLinkWithCoords) => color(d.source.label))
      .attr('stroke-width', (d: SankeyLinkWithCoords) => Math.max(1, d.width || 0))
      .attr('fill', 'none')
      .attr('opacity', 0.5)
      .append('title')
      .text((d: SankeyLinkWithCoords) => `${d.source.label} → ${d.target.label}\n${d.value} 回`);

    // Add nodes
    svg
      .append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', (d: SankeyNodeWithCoords) => d.x0 || 0)
      .attr('y', (d: SankeyNodeWithCoords) => d.y0 || 0)
      .attr('height', (d: SankeyNodeWithCoords) => (d.y1 || 0) - (d.y0 || 0))
      .attr('width', (d: SankeyNodeWithCoords) => (d.x1 || 0) - (d.x0 || 0))
      .attr('fill', (d: SankeyNodeWithCoords) => color(d.label))
      .append('title')
      .text((d: SankeyNodeWithCoords) => `${d.label}\n${d.value} 回`);

    // Add labels
    svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', (d: SankeyNodeWithCoords) => ((d.x0 || 0) < width / 2 ? (d.x1 || 0) + 6 : (d.x0 || 0) - 6))
      .attr('y', (d: SankeyNodeWithCoords) => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: SankeyNodeWithCoords) => ((d.x0 || 0) < width / 2 ? 'start' : 'end'))
      .text((d: SankeyNodeWithCoords) => d.label)
      .style('font-size', '12px');
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 flex items-center justify-center h-96">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 flex items-center justify-center h-96">
          <div className="text-red-500">データの読み込みに失敗しました</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold">会話フロー分析</h3>
      </div>
      <div className="p-6">
        <svg
          ref={svgRef}
          width={800}
          height={600}
          className="w-full h-auto"
          viewBox={`0 0 800 600`}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
}
