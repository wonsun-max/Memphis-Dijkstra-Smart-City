# -*- coding: utf-8 -*-
"""
🏙️ Min-Heap Optimized Dijkstra's Algorithm in Python
Author: 이원선 (Won-sun Lee) - Manila Korean Academy, Grade 12
"""

import heapq

class Graph:
    def __init__(self):
        self.adjacency_list = {}

    def add_edge(self, u, v, weight):
        if u not in self.adjacency_list:
            self.adjacency_list[u] = []
        self.adjacency_list[u].append((v, weight))

    def dijkstra(self, start, end):
        # Initialize all distances to Infinity
        distances = {node: float('inf') for node in self.adjacency_list}
        # Add destination node to distances table if not present as source
        for u in self.adjacency_list:
            for v, _ in self.adjacency_list[u]:
                if v not in distances:
                    distances[v] = float('inf')

        distances[start] = 0.0
        
        # Parent mapping for path reconstruction
        parent = {node: None for node in distances}
        
        # Priority Queue: storing tuples of (distance, node)
        priority_queue = [(0.0, start)]
        visited = set()

        print(f"\n=== [Python Dijkstra Min-Heap Engine Execution] ===")
        step = 1

        while priority_queue:
            # Extract vertex with minimum distance
            current_dist, u = heapq.heappop(priority_queue)

            if u in visited:
                continue

            print(f"Step {step}: Visiting Node {u} (Current dist: {current_dist})")
            visited.add(u)

            if u == end:
                print(f"Target Node {end} reached. Stop execution.")
                break

            # Relax all neighbors of node u
            if u in self.adjacency_list:
                for v, weight in self.adjacency_list[u]:
                    if v in visited:
                        continue
                        
                    alt = current_dist + weight
                    print(f"  - Checking edge {u} -> {v} (Weight: {weight})")
                    
                    # Relaxation Step
                    if alt < distances[v]:
                        distances[v] = alt
                        parent[v] = u
                        heapq.heappush(priority_queue, (alt, v))
                        print(f"    => Relaxed Node {v}. Updated dist[{v}] = {alt} via {u}")
            step += 1

        # Reconstruct shortest path
        path = []
        if distances[end] != float('inf'):
            curr = end
            while curr is not None:
                path.insert(0, curr)
                curr = parent[curr]

        print("\n=== [Path Reconstruction] ===")
        if path:
            print(f"Shortest path: {' -> '.join(path)}")
            print(f"Total Weighted Cost: {distances[end]}")
        else:
            print("No path found.")

        return path, distances[end]

if __name__ == "__main__":
    g = Graph()
    
    # Adding edges corresponding to the paper scenario
    g.add_edge('A', 'B', 3.2)  # A -> B
    g.add_edge('A', 'C', 7.5)  # A -> C
    g.add_edge('B', 'C', 1.9)  # B -> C
    g.add_edge('B', 'D', 5.4)  # B -> D
    g.add_edge('C', 'E', 6.2)  # C -> E
    g.add_edge('D', 'E', 2.7)  # D -> E
    g.add_edge('D', 'F', 4.5)  # D -> F
    g.add_edge('E', 'F', 3.1)  # E -> F
    g.add_edge('B', 'F', 11.9) # B -> F

    g.dijkstra('A', 'F')
