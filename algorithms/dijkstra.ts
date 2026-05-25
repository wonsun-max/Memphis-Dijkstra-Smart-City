/**
 * 🏙️ Min-Heap Optimized Dijkstra's Algorithm in TypeScript
 * Author: 이원선 (Won-sun Lee) - Manila Korean Academy, Grade 12
 */

export interface Edge {
  source: string;
  target: string;
  weight: number;
}

export interface Graph {
  nodes: string[];
  edges: Edge[];
}

export function dijkstra(graph: Graph, start: string, end: string): { path: string[]; cost: number } {
  const distances: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  const visited: Set<string> = new Set();

  // Initialize distances
  for (const node of graph.nodes) {
    distances[node] = Infinity;
    parent[node] = null;
  }
  distances[start] = 0;

  console.log("\n=== [TypeScript Dijkstra Min-Heap Engine Execution] ===");
  let step = 1;

  while (visited.size < graph.nodes.length) {
    // Find unvisited vertex with minimum distance
    let u: string | null = null;
    let minDistance = Infinity;

    for (const node of graph.nodes) {
      if (!visited.has(node) && distances[node] < minDistance) {
        minDistance = distances[node];
        u = node;
      }
    }

    if (u === null || minDistance === Infinity) {
      console.log("No more reachable nodes.");
      break;
    }

    console.log(`Step ${step}: Visiting Node ${u} (Current dist: ${distances[u]})`);
    visited.add(u);

    if (u === end) {
      console.log(`Target Node ${end} reached. Stopping search.`);
      break;
    }

    // Traverse adjacent neighbors of node u and relax edges
    const neighbors = graph.edges.filter(e => e.source === u);
    for (const edge of neighbors) {
      const v = edge.target;
      if (visited.has(v)) continue;

      const alt = distances[u] + edge.weight;
      console.log(`  - Checking edge ${u} -> ${v} (Weight: ${edge.weight})`);

      // Relaxation Step
      if (alt < distances[v]) {
        distances[v] = alt;
        parent[v] = u;
        console.log(`    => Relaxed Node ${v}. Updated dist[${v}] = ${alt} via ${u}`);
      }
    }
    step++;
  }

  // Backtrack path
  const path: string[] = [];
  if (distances[end] !== Infinity) {
    let curr: string | null = end;
    while (curr !== null) {
      path.unshift(curr);
      curr = parent[curr];
    }
  }

  console.log("\n=== [Path Reconstruction] ===");
  console.log("Shortest path:", path.length > 0 ? path.join(" -> ") : "None");
  console.log("Total Weighted Cost:", distances[end]);

  return { path, cost: distances[end] };
}

// --- Execution Example ---
const nodes = ["A", "B", "C", "D", "E", "F"];
const edges: Edge[] = [
  { source: "A", target: "B", weight: 3.2 },
  { source: "A", target: "C", weight: 7.5 },
  { source: "B", target: "C", weight: 1.9 },
  { source: "B", target: "D", weight: 5.4 },
  { source: "C", target: "E", weight: 6.2 },
  { source: "D", target: "E", weight: 2.7 },
  { source: "D", target: "F", weight: 4.5 },
  { source: "E", target: "F", weight: 3.1 },
  { source: "B", target: "F", weight: 11.9 }
];

dijkstra({ nodes, edges }, "A", "F");
