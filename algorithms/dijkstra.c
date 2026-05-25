#include <stdio.h>
#include <stdlib.h>
#include <float.h>

/**
 * 🏙️ Min-Heap Optimized Dijkstra's Algorithm in C
 * Author: 이원선 (Won-sun Lee) - Manila Korean Academy, Grade 12
 * 
 * Note: Since C lacks a standard priority queue library, this program 
 * implements a complete Binary Min-Heap from scratch using arrays and structures.
 */

// Structure to represent a node in the Min-Heap
typedef struct MinHeapNode {
    int v;
    double dist;
} MinHeapNode;

// Structure to represent the Min-Heap
typedef struct MinHeap {
    int size;      // Current number of elements
    int capacity;  // Maximum capacity
    int *pos;      // Position mapping for decreaseKey helper: pos[v] = index of node v in heap
    MinHeapNode **array;
} MinHeap;

// Helper to create a new Min-Heap Node
MinHeapNode* newMinHeapNode(int v, double dist) {
    MinHeapNode* minHeapNode = (MinHeapNode*)malloc(sizeof(MinHeapNode));
    minHeapNode->v = v;
    minHeapNode->dist = dist;
    return minHeapNode;
}

// Helper to create a Min-Heap
MinHeap* createMinHeap(int capacity) {
    MinHeap* minHeap = (MinHeap*)malloc(sizeof(MinHeap));
    minHeap->pos = (int*)malloc(capacity * sizeof(int));
    minHeap->size = 0;
    minHeap->capacity = capacity;
    minHeap->array = (MinHeapNode**)malloc(capacity * sizeof(MinHeapNode*));
    return minHeap;
}

// Swap two nodes in the Min-Heap (used for heapify operations)
void swapMinHeapNode(MinHeapNode** a, MinHeapNode** b) {
    MinHeapNode* t = *a;
    *a = *b;
    *b = t;
}

// Standard Heapify function to maintain the Min-Heap property
void minHeapify(MinHeap* minHeap, int idx) {
    int smallest, left, right;
    smallest = idx;
    left = 2 * idx + 1;
    right = 2 * idx + 2;

    if (left < minHeap->size && minHeap->array[left]->dist < minHeap->array[smallest]->dist) {
        smallest = left;
    }

    if (right < minHeap->size && minHeap->array[right]->dist < minHeap->array[smallest]->dist) {
        smallest = right;
    }

    if (smallest != idx) {
        // Update positions in the pos mapping array
        MinHeapNode* nextNode = minHeap->array[smallest];
        MinHeapNode* currNode = minHeap->array[idx];

        minHeap->pos[nextNode->v] = idx;
        minHeap->pos[currNode->v] = smallest;

        // Swap actual node pointers
        swapMinHeapNode(&minHeap->array[smallest], &minHeap->array[idx]);

        minHeapify(minHeap, smallest);
    }
}

// Check if Min-Heap is empty
int isEmpty(MinHeap* minHeap) {
    return minHeap->size == 0;
}

// Extract the node with minimum distance from the heap (O(log V))
MinHeapNode* extractMin(MinHeap* minHeap) {
    if (isEmpty(minHeap)) return NULL;

    // Get the root node
    MinHeapNode* root = minHeap->array[0];

    // Replace root with the last node
    MinHeapNode* lastNode = minHeap->array[minHeap->size - 1];
    minHeap->array[0] = lastNode;

    // Update position of the last node
    minHeap->pos[root->v] = minHeap->size - 1;
    minHeap->pos[lastNode->v] = 0;

    // Shrink heap size and heapify the new root
    minHeap->size--;
    minHeapify(minHeap, 0);

    return root;
}

// Decrease the distance value of a given node v (O(log V) sift-up)
void decreaseKey(MinHeap* minHeap, int v, double dist) {
    // Get index of v in the heap array
    int i = minHeap->pos[v];

    // Update node's distance
    minHeap->array[i]->dist = dist;

    // Travel up the heap tree while maintaining heap order (sift-up)
    while (i && minHeap->array[i]->dist < minHeap->array[(i - 1) / 2]->dist) {
        // Swap node with its parent
        minHeap->pos[minHeap->array[i]->v] = (i - 1) / 2;
        minHeap->pos[minHeap->array[(i - 1) / 2]->v] = i;
        swapMinHeapNode(&minHeap->array[i], &minHeap->array[(i - 1) / 2]);

        // Move index pointer up to parent
        i = (i - 1) / 2;
    }
}

// Helper to check if node v is in the Min-Heap
int isInMinHeap(MinHeap *minHeap, int v) {
    if (minHeap->pos[v] < minHeap->size) return 1;
    return 0;
}

// Structure to represent an adjacency list node for the graph
typedef struct AdjListNode {
    int dest;
    double weight;
    struct AdjListNode* next;
} AdjListNode;

// Structure to represent an adjacency list
typedef struct AdjList {
    AdjListNode *head;
} AdjList;

// Structure to represent a Graph
typedef struct Graph {
    int V;
    AdjList* array;
} Graph;

// Helper to create a new adjacency list node
AdjListNode* newAdjListNode(int dest, double weight) {
    AdjListNode* newNode = (AdjListNode*)malloc(sizeof(AdjListNode));
    newNode->dest = dest;
    newNode->weight = weight;
    newNode->next = NULL;
    return newNode;
}

// Helper to create a graph of V vertices
Graph* createGraph(int V) {
    Graph* graph = (Graph*)malloc(sizeof(Graph));
    graph->V = V;
    graph->array = (AdjList*)malloc(V * sizeof(AdjList));
    for (int i = 0; i < V; ++i) {
        graph->array[i].head = NULL;
    }
    return graph;
}

// Add a directed edge to the graph
void addEdge(Graph* graph, int src, int dest, double weight) {
    AdjListNode* newNode = newAdjListNode(dest, weight);
    newNode->next = graph->array[src].head;
    graph->array[src].head = newNode;
}

// Dijkstra Algorithm execution
void dijkstra(Graph* graph, int start, int end, char nodeNames[]) {
    int V = graph->V;
    double* dist = (double*)malloc(V * sizeof(double));
    int* parent = (int*)malloc(V * sizeof(int));

    MinHeap* minHeap = createMinHeap(V);

    // Initialize all distances as infinite and push all vertices to heap
    for (int v = 0; v < V; ++v) {
        dist[v] = DBL_MAX;
        parent[v] = -1;
        minHeap->array[v] = newMinHeapNode(v, dist[v]);
        minHeap->pos[v] = v;
    }

    // Initialize start node distance as 0 and update its position in heap
    dist[start] = 0.0;
    decreaseKey(minHeap, start, dist[start]);
    minHeap->size = V;

    printf("\n=== [C-Language Dijkstra Min-Heap Engine Execution] ===\n");

    while (!isEmpty(minHeap)) {
        // Extract minimum distance vertex
        MinHeapNode* minHeapNode = extractMin(minHeap);
        int u = minHeapNode->v;

        printf("Visiting Node %c (Current dist: %.1f)\n", nodeNames[u], dist[u]);

        if (u == end) {
            printf("Target Node %c reached. Path resolution complete.\n", nodeNames[end]);
            break;
        }

        // Traverse all adjacent vertices of u and relax edges
        AdjListNode* pCrawl = graph->array[u].head;
        while (pCrawl != NULL) {
            int v = pCrawl->dest;

            // Relaxation Step
            if (isInMinHeap(minHeap, v) && dist[u] != DBL_MAX && pCrawl->weight + dist[u] < dist[v]) {
                dist[v] = dist[u] + pCrawl->weight;
                parent[v] = u;
                decreaseKey(minHeap, v, dist[v]);
                printf("  -> Relaxed Node %c. Updated dist[%c] = %.1f via %c\n", nodeNames[v], nodeNames[v], dist[v], nodeNames[u]);
            }
            pCrawl = pCrawl->next;
        }
        free(minHeapNode);
    }

    // Print final shortest path using backtracking
    printf("\n=== [Path Reconstruction] ===\n");
    if (dist[end] == DBL_MAX) {
        printf("No path exists from %c to %c.\n", nodeNames[start], nodeNames[end]);
    } else {
        printf("Shortest path: ");
        int curr = end;
        int pathLen = 0;
        int tempPath[100];
        
        while (curr != -1) {
            tempPath[pathLen++] = curr;
            curr = parent[curr];
        }
        
        for (int i = pathLen - 1; i >= 0; i--) {
            printf("%c", nodeNames[tempPath[i]]);
            if (i > 0) printf(" -> ");
        }
        printf("\nTotal Weighted Cost: %.1f\n", dist[end]);
    }

    // Free resources
    free(dist);
    free(parent);
    free(minHeap->pos);
    free(minHeap->array);
    free(minHeap);
}

// Test scenario mapping
int main() {
    int V = 6;
    Graph* graph = createGraph(V);
    
    // Mapping node indices to characters: A=0, B=1, C=2, D=3, E=4, F=5
    char nodeNames[] = {'A', 'B', 'C', 'D', 'E', 'F'};

    // Adding edges corresponding to the paper scenario
    addEdge(graph, 0, 1, 3.2);  // A -> B (3.2)
    addEdge(graph, 0, 2, 7.5);  // A -> C (7.5)
    addEdge(graph, 1, 2, 1.9);  // B -> C (1.9)
    addEdge(graph, 1, 3, 5.4);  // B -> D (5.4)
    addEdge(graph, 2, 4, 6.2);  // C -> E (6.2)
    addEdge(graph, 3, 4, 2.7);  // D -> E (2.7)
    addEdge(graph, 3, 5, 4.5);  // D -> F (4.5)
    addEdge(graph, 4, 5, 3.1);  // E -> F (3.1)
    addEdge(graph, 1, 5, 11.9); // B -> F (11.9)

    // Execute Dijkstra from Node A (index 0) to Node F (index 5)
    dijkstra(graph, 0, 5, nodeNames);

    return 0;
}
