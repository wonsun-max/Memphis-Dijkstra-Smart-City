import React, { useState, useEffect, useMemo } from 'react';
import { runInstantDijkstra, GraphData, Node, Edge } from '../utils/dijkstra';
import { AlertTriangle, Car, CheckCircle2, Navigation } from 'lucide-react';

const cityNodes: Node[] = [
  { id: 'Home', label: '🏠 집', x: 100, y: 150 },
  { id: 'N1', label: '교차로1', x: 300, y: 150 },
  { id: 'N2', label: '교차로2', x: 500, y: 150 },
  { id: 'Cafe', label: '☕ 카페', x: 700, y: 150 },
  
  { id: 'N3', label: '교차로3', x: 100, y: 350 },
  { id: 'N4', label: '중앙탑', x: 300, y: 350 },
  { id: 'Park', label: '🌳 공원', x: 500, y: 350 },
  { id: 'N5', label: '교차로5', x: 700, y: 350 },
  
  { id: 'Station', label: '🚆 역', x: 100, y: 550 },
  { id: 'N6', label: '교차로6', x: 300, y: 550 },
  { id: 'N7', label: '교차로7', x: 500, y: 550 },
  { id: 'Work', label: '🏢 회사', x: 700, y: 550 },
];

const cityEdges: Edge[] = [
  // Horizontal
  { source: 'Home', target: 'N1', weight: 5 },
  { source: 'N1', target: 'N2', weight: 4 },
  { source: 'N2', target: 'Cafe', weight: 3 },
  { source: 'N3', target: 'N4', weight: 4 },
  { source: 'N4', target: 'Park', weight: 6 },
  { source: 'Park', target: 'N5', weight: 3 },
  { source: 'Station', target: 'N6', weight: 5 },
  { source: 'N6', target: 'N7', weight: 4 },
  { source: 'N7', target: 'Work', weight: 3 },
  // Vertical
  { source: 'Home', target: 'N3', weight: 4 },
  { source: 'N1', target: 'N4', weight: 6 },
  { source: 'N2', target: 'Park', weight: 5 },
  { source: 'Cafe', target: 'N5', weight: 6 },
  { source: 'N3', target: 'Station', weight: 7 },
  { source: 'N4', target: 'N6', weight: 3 },
  { source: 'Park', target: 'N7', weight: 4 },
  { source: 'N5', target: 'Work', weight: 5 },
  // Diagonals (shortcuts)
  { source: 'Home', target: 'N4', weight: 8 },
  { source: 'N4', target: 'Work', weight: 10 },
];

export default function RealWorldView() {
  const [graph, setGraph] = useState<GraphData>({ nodes: cityNodes, edges: cityEdges.map(e => ({ ...e })) });
  const [startId, setStartId] = useState('Home');
  const [endId, setEndId] = useState('Work');
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info' | 'alert' | 'success'}[]>([]);

  const addLog = (msg: string, type: 'info' | 'alert' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 10)); // keep last 10
  };

  const path = useMemo(() => {
    return runInstantDijkstra(graph, startId, endId);
  }, [graph, startId, endId]);

  useEffect(() => {
    if (logs.length === 0) {
      addLog('스마트 네비게이션 시스템을 시작합니다. (출발: 집 -> 도착: 회사)', 'info');
      addLog('경우의 수를 계산하여 최단 경로를 안내합니다.', 'success');
    }
  }, []);

  const handleEdgeClick = (edgeIndex: number) => {
    const newEdges = [...graph.edges];
    const edge = newEdges[edgeIndex];
    
    edge.isBroken = !edge.isBroken;
    setGraph({ ...graph, edges: newEdges });

    const sourceLabel = cityNodes.find(n => n.id === edge.source)?.label || edge.source;
    const targetLabel = cityNodes.find(n => n.id === edge.target)?.label || edge.target;

    if (edge.isBroken) {
      addLog(`🚨 사고 발생 보고됨: ${sourceLabel} ↔ ${targetLabel} 도로 통제!`, 'alert');
      addLog(`📡 실시간 교통 정보 업데이트... 새로운 우회 경로를 탐색합니다.`, 'info');
    } else {
      addLog(`✅ 도로 복구 완료: ${sourceLabel} ↔ ${targetLabel} 통행 재개.`, 'success');
      addLog(`📡 최적 경로를 다시 계산합니다.`, 'info');
    }
  };

  const getEdgeColor = (source: string, target: string, isBroken: boolean) => {
    if (isBroken) return '#ff0000'; // red
    
    // is in optimal path?
    if (path.length > 0) {
      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i];
        const v = path[i + 1];
        if ((u === source && v === target) || (u === target && v === source)) {
          return '#00f0ff'; // cyan path
        }
      }
    }
    return '#e5e7eb'; // default gray road
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white memphis-border p-4 shadow-[4px_4px_0_0_#ff00a0] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-black uppercase flex items-center justify-center md:justify-start gap-2">
            <Navigation className="text-[#6100ff]" /> Smart Navigation GPS
          </h2>
          <p className="text-gray-600 font-bold mt-1 text-sm md:text-base">
            도로(선)를 클릭하여 실시간으로 사고(통제) 상황을 시뮬레이션 해보세요.
          </p>
        </div>
        <div className="flex bg-[#fdf5df] p-2 memphis-border items-center gap-2 md:gap-4 text-base md:text-xl font-bold w-full md:w-auto justify-center">
          <div>출발: {cityNodes.find(n => n.id === startId)?.label.replace(/[^\uAC00-\uD7A3]/g, '')}</div>
          <div>👉</div>
          <div>도착: {cityNodes.find(n => n.id === endId)?.label.replace(/[^\uAC00-\uD7A3]/g, '')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
        {/* Map visualization */}
        <div className="bg-[#f0f9ff] memphis-border memphis-shadow overflow-hidden relative col-span-1 lg:col-span-2 min-h-[400px] lg:min-h-0">
          {/* Map background grid pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <svg viewBox="0 0 800 700" className="w-full h-full relative z-10 font-sans" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
            {/* Edges */}
            {graph.edges.map((edge, i) => {
              const source = graph.nodes.find(n => n.id === edge.source)!;
              const target = graph.nodes.find(n => n.id === edge.target)!;
              const isPath = path.length > 0 && path.some((p, pi) => pi < path.length - 1 && ((p === source.id && path[pi + 1] === target.id) || (p === target.id && path[pi + 1] === source.id)));
              
              const textX = (source.x + target.x) / 2;
              const textY = (source.y + target.y) / 2;

              return (
                <g key={`road-${i}`} className="cursor-pointer group" onClick={() => handleEdgeClick(i)}>
                  {/* Invisible wide hit area */}
                  <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="transparent" strokeWidth="20" />
                  
                  {/* Outline for path */}
                  {isPath && !edge.isBroken && (
                    <line 
                      x1={source.x} y1={source.y} x2={target.x} y2={target.y} 
                      stroke="#000" strokeWidth="12" 
                    />
                  )}
                  
                  {/* Main Road Line */}
                  <line 
                    x1={source.x} y1={source.y} 
                    x2={target.x} y2={target.y} 
                    stroke={getEdgeColor(source.id, target.id, !!edge.isBroken)} 
                    strokeWidth={isPath ? 8 : 6}
                    strokeDasharray={edge.isBroken ? "10, 10" : "none"}
                    className="transition-colors duration-200"
                  />
                  
                  {/* Traffic jam / broken icon */}
                  {edge.isBroken ? (
                     <g transform={`translate(${textX - 16}, ${textY - 16})`}>
                       <circle cx="16" cy="16" r="16" fill="#fff" stroke="#ff0000" strokeWidth="3" />
                       <path d="M16 8v8 M16 20h.01" stroke="#ff0000" strokeWidth="3" strokeLinecap="round" />
                     </g>
                  ) : (
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <rect x={textX - 25} y={textY - 15} width={50} height={30} fill="#000" rx="4" />
                      <text x={textX} y={textY} fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle" alignmentBaseline="central" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                        차단하기
                      </text>
                    </g>
                  )}

                  {/* Weight / Dist label */}
                  {!edge.isBroken && (
                     <text x={textX} y={textY - 10} fill="#666" fontSize="16" fontWeight="bold" textAnchor="middle" className="pointer-events-none drop-shadow-md" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                       {edge.weight}km
                     </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {graph.nodes.map((node) => {
              const isStart = node.id === startId;
              const isEnd = node.id === endId;
              const inPath = path.includes(node.id);
              
              const [emoji, name] = node.label.includes(' ') ? node.label.split(' ') : ['', node.label];

              return (
                <g key={node.id} className="pointer-events-none">
                  <circle 
                    cx={node.x} cy={node.y} r={inPath ? "24" : "18"} 
                    fill={isStart ? '#ffe600' : isEnd ? '#ff00a0' : inPath ? '#ffffff' : '#d1d5db'}
                    stroke="#000" strokeWidth="4" 
                  />
                  {emoji && (
                    <text x={node.x} y={node.y - 30} textAnchor="middle" fontSize="24">
                      {emoji}
                    </text>
                  )}
                  <rect x={node.x - 30} y={node.y + 15} width={60} height={24} fill="#000" rx="4" />
                  <text 
                    x={node.x} y={node.y + 27} 
                    textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff"
                    style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                  >
                    {name || node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Internet / GPS Status logs */}
        <div className="bg-black text-[#00f0ff] p-4 flex flex-col font-mono relative overflow-hidden memphis-shadow min-h-[400px] lg:min-h-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f0ff] via-[#ff00a0] to-[#ffe600]"></div>
          
          <h3 className="text-xl font-bold uppercase mb-4 flex items-center justify-between border-b border-[#333] pb-2">
            <span>Live Traffic Hub</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00f0ff]"></span>
              </span>
              <span className="text-sm">ONLINE</span>
            </div>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {logs.map((log, idx) => (
              <div key={idx} className={`text-sm p-3 border-l-4 ${log.type === 'alert' ? 'border-[#ff00a0] bg-[#ff00a0]/10 text-[#ffbde1]' : log.type === 'success' ? 'border-[#ffe600] bg-[#ffe600]/10 text-[#fff5a3]' : 'border-[#00f0ff] bg-[#00f0ff]/10'}`}>
                <div className="text-xs opacity-50 mb-1">[{log.time}]</div>
                <div className="flex items-start gap-2">
                  {log.type === 'alert' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  {log.type === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  {log.type === 'info' && <Car className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  <span>{log.msg}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-[#222] border border-[#333]">
            <div className="text-xs text-gray-400 mb-1 uppercase">Current Route Route</div>
            {path.length > 0 ? (
              <div className="font-bold text-[#ffe600]">
                {path.map(p => cityNodes.find(n => n.id === p)?.label.replace(/[^\uAC00-\uD7A3]/g, '') || p).join(' → ')}
              </div>
            ) : (
              <div className="font-bold text-[#ff0000] blink">우회 경로 검색 불가!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
