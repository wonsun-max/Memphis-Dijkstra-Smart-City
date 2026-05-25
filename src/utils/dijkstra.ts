export type Node = { id: string; x: number; y: number; label?: string };
export type Edge = { source: string; target: string; weight: number; isBroken?: boolean };

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface DijkstraState {
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  visited: string[];
  currentHighlight: string | null;
  edgeHighlight: [string, string] | null;
  logs: string[];
  path: string[];
  isFinished: boolean;
}

export function runInstantDijkstra(graph: GraphData, startId: string, endId: string): string[] {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited: Set<string> = new Set();
  
  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  }
  distances[startId] = 0;

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentId = nodeId;
      }
    }

    if (currentId === null || minDistance === Infinity) {
      break;
    }

    unvisited.delete(currentId);
    if (currentId === endId) break;

    const neighbors = graph.edges.filter(e => 
      (e.source === currentId || e.target === currentId) && !e.isBroken
    );

    for (const edge of neighbors) {
      const neighborId = edge.source === currentId ? edge.target : edge.source;
      if (!unvisited.has(neighborId)) continue;

      const alt = distances[currentId] + edge.weight;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = currentId;
      }
    }
  }

  const path: string[] = [];
  if (distances[endId] !== Infinity) {
    let curr: string | null = endId;
    while (curr !== null) {
      path.unshift(curr);
      curr = previous[curr];
    }
  }
  return path;
}

export function* runDijkstraGenerator(graph: GraphData, startId: string, endId: string | null = null): Generator<DijkstraState, DijkstraState, unknown> {

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited: Set<string> = new Set();
  const logs: string[] = [];
  
  // Initialize
  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  }
  distances[startId] = 0;
  logs.push(`🚀 Started search from Node ${startId}`);

  let state: DijkstraState = {
    distances: { ...distances },
    previous: { ...previous },
    visited: Array.from(visited),
    currentHighlight: null,
    edgeHighlight: null,
    logs: [...logs],
    path: [],
    isFinished: false,
  };
  
  yield state;

  while (visited.size < graph.nodes.length) {
    // Find unvisited node with minimum distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    for (const nodeId in distances) {
      if (!visited.has(nodeId) && distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentId = nodeId;
      }
    }

    if (currentId === null || minDistance === Infinity) {
      logs.push('❌ No more reachable nodes.');
      break;
    }

    // Highlight current node
    state = { ...state, currentHighlight: currentId, edgeHighlight: null, logs: [...logs, `🔍 Visiting Node ${currentId} (Dist: ${distances[currentId]})`] };
    yield state;

    visited.add(currentId);
    state = { ...state, visited: Array.from(visited) };

    // If we reached the target, we can optionally stop early, but let's explore all
    // to match standard table unless specified. Let's explore all.

    // Get neighbors
    const neighbors = graph.edges.filter(e => 
      (e.source === currentId || e.target === currentId) && !e.isBroken
    );

    for (const edge of neighbors) {
      const neighborId = edge.source === currentId ? edge.target : edge.source;
      
      if (!visited.has(neighborId)) {
        state = { ...state, edgeHighlight: [currentId, neighborId], logs: [...logs, `📐 Checking edge ${currentId}-${neighborId} (Weight: ${edge.weight})`] };
        yield state;

        const alt = distances[currentId] + edge.weight;
        if (alt < distances[neighborId]) {
          distances[neighborId] = alt;
          previous[neighborId] = currentId;
          const oldLog = [...logs];
          logs.push(`✅ Relax: dist[${neighborId}] updated to ${alt}`);
          state = { ...state, distances: { ...distances }, previous: { ...previous }, logs: [...logs] };
          yield state;
        } else {
          logs.push(`➖ No update for ${neighborId} (Current dist ${distances[neighborId]} <= ${alt})`);
          state = { ...state, logs: [...logs] };
          yield state;
        }
      }
    }
  }

  // Construct path
  const path: string[] = [];
  let pathStr = "None"; // Default assuming no path found
  
  // if endId is provided, build path
  if (endId && distances[endId] !== Infinity) {
     let curr: string | null = endId;
     while (curr !== null) {
       path.unshift(curr);
       curr = previous[curr];
     }
     pathStr = path.join(' → ');
     logs.push(`🎉 Shortest Path found: ${pathStr} (Cost: ${distances[endId]})`);
  } else {
     logs.push(`🏁 algorithm finished. No specific target path extracted, or target unreachable.`);
  }

  const finalState = {
    distances: { ...distances },
    previous: { ...previous },
    visited: Array.from(visited),
    currentHighlight: null,
    edgeHighlight: null,
    logs: [...logs],
    path,
    isFinished: true,
  };
  
  yield finalState;
  return finalState;
}
