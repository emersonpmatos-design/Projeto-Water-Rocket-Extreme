import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  x: number;
  y: number;
}

interface RocketPlotProps {
  data: DataPoint[];
  maxDistance: number;
  maxHeight: number;
}

export const RocketPlot: React.FC<RocketPlotProps> = ({ data, maxDistance, maxHeight }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || data.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const xExtent = d3.extent(data, (d: DataPoint) => d.x) as [number, number];
    const yExtent = d3.extent(data, (d: DataPoint) => d.y) as [number, number];

    // Maintain aspect ratio for realism
    const targetX = Math.max(xExtent[1], 10);
    const targetY = Math.max(yExtent[1], 5);
    
    // Scale everything to fit with padding
    const xScale = d3.scaleLinear()
      .domain([0, targetX * 1.1])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, targetY * 1.2])
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    const xAxis = d3.axisBottom(xScale).ticks(10).tickSize(-(height - margin.top - margin.bottom));
    const yAxis = d3.axisLeft(yScale).ticks(10).tickSize(-(width - margin.left - margin.right));

    svg.append('g')
      .attr('class', 'grid text-white/5')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('.tick line')
      .attr('stroke', 'currentColor')
      .attr('stroke-dasharray', '2,2');

    svg.append('g')
      .attr('class', 'grid text-white/5')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .selectAll('.tick line')
      .attr('stroke', 'currentColor')
      .attr('stroke-dasharray', '2,2');

    // Remove text and paths from grid
    svg.selectAll('.grid path').remove();
    svg.selectAll('.grid text').remove();

    // Axes labels
    const axisColor = '#666';
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('color', axisColor)
      .selectAll('text')
      .attr('font-family', 'JetBrains Mono');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', axisColor)
      .selectAll('text')
      .attr('font-family', 'JetBrains Mono');

    // X Axis Label
    svg.append('text')
      .attr('x', width - margin.right)
      .attr('y', height - 20)
      .attr('text-anchor', 'end')
      .attr('fill', '#888')
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-weight', 'bold')
      .text('ALCANCE_HORIZONTAL (M)');

    // Y Axis Label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -margin.top)
      .attr('y', 20)
      .attr('text-anchor', 'end')
      .attr('fill', '#888')
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-weight', 'bold')
      .text('ALTITUDE_REALTIME (M)');

    // Line generator
    const line = d3.line<DataPoint>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);

    // Area generator for the shadow
    const area = d3.area<DataPoint>()
      .x(d => xScale(d.x))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);

    // Draw shadow
    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#gradient-shadow)')
      .attr('d', area);

    // Gradient definitions
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'gradient-shadow')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#00ff66').attr('stop-opacity', 0.1);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#00ff66').attr('stop-opacity', 0);

    // Draw trajectory
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#00ff66')
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line)
      .attr('filter', 'drop-shadow(0 0 4px rgba(0, 255, 102, 0.4))')
      .attr('stroke-dasharray', function() {
        const length = this.getTotalLength();
        return `${length} ${length}`;
      })
      .attr('stroke-dashoffset', function() {
        return this.getTotalLength();
      })
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] relative font-mono">
      <svg ref={svgRef} className="w-full h-full overflow-visible" />
    </div>
  );
};
