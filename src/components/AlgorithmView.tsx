import React, { useState, useEffect, useRef } from 'react';
import { runDijkstraGenerator, GraphData, Node, Edge, DijkstraState } from '../utils/dijkstra';
import { Play, RotateCcw, AlertCircle } from 'lucide-react';

const initialGraph: GraphData = {
  nodes: [
    { id: 'S', x: 80, y: 300 },
    { id: 'A', x: 250, y: 150 },
    { id: 'B', x: 250, y: 450 },
    { id: 'C', x: 450, y: 250 },
    { id: 'D', x: 450, y: 380 },
    { id: 'E', x: 650, y: 150 },
    { id: 'F', x: 650, y: 450 },
    { id: 'G', x: 820, y: 300 },
  ],
  edges: [
    { source: 'S', target: 'A', weight: 4 },
    { source: 'S', target: 'B', weight: 2 },
    { source: 'A', target: 'C', weight: 5 },
    { source: 'A', target: 'D', weight: 10 },
    { source: 'B', target: 'C', weight: 8 },
    { source: 'B', target: 'D', weight: 3 },
    { source: 'C', target: 'D', weight: 1 },
    { source: 'C', target: 'E', weight: 6 },
    { source: 'C', target: 'F', weight: 2 },
    { source: 'D', target: 'F', weight: 7 },
    { source: 'E', target: 'G', weight: 3 },
    { source: 'E', target: 'F', weight: 4 },
    { source: 'F', target: 'G', weight: 5 },
  ]
};

export default function AlgorithmView() {
  const [startNode, setStartNode] = useState<string | null>(null);
  const [endNode, setEndNode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [algoState, setAlgoState] = useState<DijkstraState | null>(null);
  const generatorRef = useRef<Generator<DijkstraState, DijkstraState, unknown> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [graph] = useState<GraphData>(initialGraph);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [algoState?.logs]);

  const handleNodeClick = (nodeId: string) => {
    if (isPlaying) return;
    
    if (!startNode || (startNode && endNode)) {
      // fresh start
      setStartNode(nodeId);
      setEndNode(null);
      setAlgoState(null);
      generatorRef.current = null;
    } else if (startNode && !endNode && startNode !== nodeId) {
      setEndNode(nodeId);
    }
  };

  const startSearch = () => {
    if (!startNode || !endNode) return;
    setIsPlaying(true);
    generatorRef.current = runDijkstraGenerator(graph, startNode, endNode);
    timerRef.current = setInterval(() => {
      if (generatorRef.current) {
        const { value, done } = generatorRef.current.next();
        if (value) setAlgoState(value);
        if (done) {
          stopTimer();
          setIsPlaying(false);
        }
      }
    }, speed);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const reset = () => {
    stopTimer();
    setIsPlaying(false);
    setStartNode(null);
    setEndNode(null);
    setAlgoState(null);
    generatorRef.current = null;
  };

  const getNodeColor = (id: string) => {
    if (id === startNode) return '#00f0ff'; // cyan
    if (id === endNode) return '#ff00a0'; // magenta
    if (algoState?.currentHighlight === id) return '#ffe600'; // yellow
    if (algoState?.visited.includes(id)) return '#bbf7d0'; // light green
    return '#ffffff';
  };

  const getEdgeColor = (source: string, target: string) => {
    if (algoState?.edgeHighlight) {
      const [u, v] = algoState.edgeHighlight;
      if ((u === source && v === target) || (u === target && v === source)) {
        return '#ff00a0'; // Highlight color
      }
    }
    // Check if edge is in final path
    if (algoState?.path && algoState.path.length > 0) {
      for (let i = 0; i < algoState.path.length - 1; i++) {
        const u = algoState.path[i];
        const v = algoState.path[i + 1];
        if ((u === source && v === target) || (u === target && v === source)) {
          return '#ffe600'; // Path color
        }
      }
    }
    return '#000000'; // Default
  };

  const getEdgeThickness = (source: string, target: string) => {
    if (getEdgeColor(source, target) === '#ffe600') return 6;
    return 3;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls & Legend */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white memphis-border p-4 gap-4">
        <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-bold w-full xl:w-auto">
          <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full border-2 border-black bg-[#00f0ff]"></div> 시작</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full border-2 border-black bg-[#ff00a0]"></div> 목적지</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full border-2 border-black bg-[#ffe600]"></div> 현재/경로</span>
          <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full border-2 border-black bg-[#bbf7d0]"></div> 탐색됨</span>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <select 
            value={speed} 
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="memphis-border px-2 py-2 font-bold bg-[#fdf5df] outline-none flex-1 xl:flex-none"
            disabled={isPlaying}
          >
            <option value={1000}>느리게</option>
            <option value={500}>보통</option>
            <option value={100}>빠르게</option>
          </select>
          <button 
            onClick={reset}
            className="flex flex-1 xl:flex-none justify-center items-center gap-1 px-4 py-2 bg-white memphis-border memphis-shadow-hover font-bold uppercase transition-all"
          >
            <RotateCcw size={16} /> 초기화
          </button>
          <button 
            onClick={startSearch}
            disabled={!startNode || !endNode || isPlaying || algoState?.isFinished}
            className="flex flex-1 xl:flex-none justify-center items-center gap-1 px-4 py-2 bg-[#ffe600] memphis-border memphis-shadow-hover font-bold uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={16} /> {isPlaying ? '탐색중...' : '시작'}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="bg-white memphis-border memphis-shadow overflow-hidden relative">
        {!startNode && (
          <div className="absolute top-4 left-4 bg-[#ff00a0] text-white font-bold px-4 py-2 memphis-border pointer-events-none z-10 flex items-center gap-2">
            <AlertCircle size={20} /> 시작 노드를 클릭하세요!
          </div>
        )}
        {startNode && !endNode && (
          <div className="absolute top-4 left-4 bg-[#00f0ff] font-bold px-4 py-2 memphis-border pointer-events-none z-10 flex items-center gap-2">
            <AlertCircle size={20} /> 목적지 노드를 클릭하세요!
          </div>
        )}

        <svg viewBox="0 0 900 600" className="w-full h-auto bg-memphis-grid font-sans" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
          {/* Edges */}
          {graph.edges.map((edge, i) => {
            const source = graph.nodes.find(n => n.id === edge.source)!;
            const target = graph.nodes.find(n => n.id === edge.target)!;
            const color = getEdgeColor(source.id, target.id);
            const thickness = getEdgeThickness(source.id, target.id);
            
            // Text position (midpoint)
            const textX = (source.x + target.x) / 2;
            const textY = (source.y + target.y) / 2 - 10;

            return (
              <g key={`edge-${i}`}>
                <line 
                  x1={source.x} y1={source.y} 
                  x2={target.x} y2={target.y} 
                  stroke={color} 
                  strokeWidth={thickness}
                  className="transition-all duration-300"
                />
                <rect 
                  x={textX - 12} y={textY - 12} 
                  width={24} height={24} 
                  fill="#ffffff" stroke="#000" strokeWidth="2" 
                />
                <text 
                  x={textX} y={textY} 
                  textAnchor="middle" 
                  alignmentBaseline="central" 
                  fontSize="14" 
                  fontWeight="bold"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {graph.nodes.map((node) => {
            const isSelected = node.id === startNode || node.id === endNode;
            
            return (
              <g 
                key={node.id} 
                className={`cursor-pointer transition-transform ${isSelected ? 'scale-110 relative z-10' : 'hover:scale-110'}`}
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                onClick={() => handleNodeClick(node.id)}
              >
                <circle 
                  cx={node.x + 4} cy={node.y + 4} r="25" fill="#000" // Shadow
                />
                <circle 
                  cx={node.x} cy={node.y} r="25" 
                  fill={getNodeColor(node.id)}
                  stroke="#000" strokeWidth="4" 
                  className="transition-colors duration-300"
                />
                <text 
                  x={node.x} y={node.y} 
                  textAnchor="middle" 
                  alignmentBaseline="central" 
                  fontSize="22" 
                  fontWeight="900" 
                  className="font-sans"
                  style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                >
                  {node.id}
                </text>
                
                {/* Distance text below node if state exists */}
                {algoState && (
                  <text 
                    x={node.x} y={node.y + 45} 
                    textAnchor="middle" 
                    fontSize="16" 
                    fontWeight="bold"
                    fill={algoState.distances[node.id] === Infinity ? '#999' : '#000'}
                    style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                  >
                    d={algoState.distances[node.id] === Infinity ? '∞' : algoState.distances[node.id]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distance Table */}
        <div className="bg-white memphis-border memphis-shadow flex flex-col h-64">
          <div className="bg-[#6100ff] text-white p-3 border-b-4 border-black font-bold uppercase tracking-wider">
            거리 테이블 (d[v])
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {algoState ? (
              <table className="w-full text-left font-mono border-collapse">
                <tbody>
                  {graph.nodes.map(node => (
                    <tr key={node.id} className="border-b-2 border-gray-200 last:border-0 hover:bg-gray-100">
                      <td className="py-2 font-bold text-lg">{node.id}</td>
                      <td className={`py-2 text-right text-lg ${algoState.distances[node.id] === Infinity ? 'text-gray-400' : 'font-bold'}`}>
                        {algoState.distances[node.id] === Infinity ? '∞' : algoState.distances[node.id]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 font-bold whitespace-pre-wrap text-center">
                탐색을 시작하면\n여기에 거리가 표시됩니다.
              </div>
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white memphis-border memphis-shadow flex flex-col h-64">
          <div className="bg-[#ff00a0] text-white p-3 border-b-4 border-black font-bold uppercase tracking-wider">
            탐색 로그
          </div>
          <div className="p-4 flex-1 overflow-y-auto font-mono text-sm space-y-2 bg-gray-50">
            {algoState?.logs.length ? (
              algoState.logs.map((log, i) => (
                <div key={i} className="pb-1 border-b border-gray-200 break-words">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center mt-10 font-bold">Waiting to start...</div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
      
      {/* Final Result Panel */}
      {algoState?.isFinished && (
        <div className="bg-[#ffe600] memphis-border memphis-shadow p-4 md:p-6 font-bold text-lg md:text-xl flex flex-col md:flex-row items-center justify-between animate-bounce mt-4 gap-4">
          <div className="text-center md:text-left break-all">
            결과: {algoState.path.length > 0 ? algoState.path.join(' → ') : '경로 없음'}
          </div>
          {algoState.path.length > 0 && endNode && (
            <div className="bg-black text-white px-4 py-2 memphis-border shadow-[2px_2px_0px_0px_#fff] w-full md:w-auto text-center md:text-left whitespace-nowrap">
              총 비용: {algoState.distances[endNode]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
