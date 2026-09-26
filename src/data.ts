export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type ProblemStatus = 'NOT_STARTED' | 'ATTEMPTED' | 'SOLVED'
export type Importance = 'Essential' | 'Important' | 'Practice'

export type Subtopic = { id: string; name: string }
export type Topic = { id: string; name: string; icon: string; subtopics: Subtopic[] }
export type Problem = {
  id: string; number: string; title: string; platform: 'LeetCode'; url: string
  difficulty: Difficulty; topicId: string; subtopicId: string; xp: number; order: number
  importance?: Importance; source?: 'seed' | 'bank' | 'admin'; tags?: string[]; published?: boolean
}
export type Progress = {
  status: ProblemStatus; attempts: number; completedAt?: string
  lastAttemptAt?: string; revisionRequired: boolean
}

export const topics: Topic[] = [
  {
    "id": "arrays",
    "name": "Arrays",
    "icon": "▦",
    "subtopics": [
      {
        "id": "arrays-1",
        "name": "Array Basics"
      },
      {
        "id": "arrays-2",
        "name": "Prefix Sum"
      },
      {
        "id": "arrays-3",
        "name": "Difference Array"
      },
      {
        "id": "arrays-4",
        "name": "Two Pointers"
      },
      {
        "id": "arrays-5",
        "name": "Sliding Window"
      },
      {
        "id": "arrays-6",
        "name": "Kadane's Algorithm"
      },
      {
        "id": "arrays-7",
        "name": "Sorting-Based Problems"
      },
      {
        "id": "arrays-8",
        "name": "Interval Problems"
      },
      {
        "id": "arrays-9",
        "name": "Matrix / 2D Arrays"
      },
      {
        "id": "arrays-10",
        "name": "Array Manipulation"
      },
      {
        "id": "arrays-11",
        "name": "Advanced Array Problems"
      }
    ]
  },
  {
    "id": "strings",
    "name": "Strings",
    "icon": "Aa",
    "subtopics": [
      {
        "id": "strings-1",
        "name": "String Basics"
      },
      {
        "id": "strings-2",
        "name": "Frequency Counting"
      },
      {
        "id": "strings-3",
        "name": "Palindrome"
      },
      {
        "id": "strings-4",
        "name": "Anagrams"
      },
      {
        "id": "strings-5",
        "name": "Substrings"
      },
      {
        "id": "strings-6",
        "name": "String Manipulation"
      },
      {
        "id": "strings-7",
        "name": "String Hashing"
      },
      {
        "id": "strings-8",
        "name": "Pattern Matching"
      },
      {
        "id": "strings-9",
        "name": "Advanced String Problems"
      }
    ]
  },
  {
    "id": "linked-list",
    "name": "Linked List",
    "icon": "↔",
    "subtopics": [
      {
        "id": "linked-list-1",
        "name": "Singly Linked List"
      },
      {
        "id": "linked-list-2",
        "name": "Doubly Linked List"
      },
      {
        "id": "linked-list-3",
        "name": "Circular Linked List"
      },
      {
        "id": "linked-list-4",
        "name": "Reversal"
      },
      {
        "id": "linked-list-5",
        "name": "Fast and Slow Pointers"
      },
      {
        "id": "linked-list-6",
        "name": "Merge Linked Lists"
      },
      {
        "id": "linked-list-7",
        "name": "Cycle Problems"
      },
      {
        "id": "linked-list-8",
        "name": "Intersection Problems"
      },
      {
        "id": "linked-list-9",
        "name": "Advanced Linked List"
      }
    ]
  },
  {
    "id": "stack-queue",
    "name": "Stack & Queue",
    "icon": "▤",
    "subtopics": [
      {
        "id": "stack-queue-1",
        "name": "Stack Basics"
      },
      {
        "id": "stack-queue-2",
        "name": "Queue Basics"
      },
      {
        "id": "stack-queue-3",
        "name": "Deque"
      },
      {
        "id": "stack-queue-4",
        "name": "Parentheses Problems"
      },
      {
        "id": "stack-queue-5",
        "name": "Monotonic Stack"
      },
      {
        "id": "stack-queue-6",
        "name": "Monotonic Queue"
      },
      {
        "id": "stack-queue-7",
        "name": "Next Greater Element"
      },
      {
        "id": "stack-queue-8",
        "name": "Expression Problems"
      },
      {
        "id": "stack-queue-9",
        "name": "Stack/Queue Design Problems"
      }
    ]
  },
  {
    "id": "hashing",
    "name": "Hashing",
    "icon": "#",
    "subtopics": [
      {
        "id": "hashing-1",
        "name": "HashMap"
      },
      {
        "id": "hashing-2",
        "name": "HashSet"
      },
      {
        "id": "hashing-3",
        "name": "Frequency Counting"
      },
      {
        "id": "hashing-4",
        "name": "Duplicate Detection"
      },
      {
        "id": "hashing-5",
        "name": "Prefix Sum + Hashing"
      },
      {
        "id": "hashing-6",
        "name": "Hashing with Strings"
      },
      {
        "id": "hashing-7",
        "name": "Advanced Hashing Problems"
      }
    ]
  },
  {
    "id": "recursion",
    "name": "Recursion",
    "icon": "↻",
    "subtopics": [
      {
        "id": "recursion-1",
        "name": "Basic Recursion"
      },
      {
        "id": "recursion-2",
        "name": "Recursion on Arrays"
      },
      {
        "id": "recursion-3",
        "name": "Recursion on Strings"
      },
      {
        "id": "recursion-4",
        "name": "Recursion on Linked Lists"
      },
      {
        "id": "recursion-5",
        "name": "Recursive Tree Problems"
      },
      {
        "id": "recursion-6",
        "name": "Recursion Patterns"
      }
    ]
  },
  {
    "id": "backtracking",
    "name": "Backtracking",
    "icon": "⌁",
    "subtopics": [
      {
        "id": "backtracking-1",
        "name": "Subsets"
      },
      {
        "id": "backtracking-2",
        "name": "Subsequences"
      },
      {
        "id": "backtracking-3",
        "name": "Permutations"
      },
      {
        "id": "backtracking-4",
        "name": "Combinations"
      },
      {
        "id": "backtracking-5",
        "name": "Combination Sum"
      },
      {
        "id": "backtracking-6",
        "name": "N-Queens"
      },
      {
        "id": "backtracking-7",
        "name": "Sudoku"
      },
      {
        "id": "backtracking-8",
        "name": "Maze Problems"
      },
      {
        "id": "backtracking-9",
        "name": "Advanced Backtracking"
      }
    ]
  },
  {
    "id": "trees",
    "name": "Trees",
    "icon": "⌁",
    "subtopics": [
      {
        "id": "trees-1",
        "name": "Binary Tree Basics"
      },
      {
        "id": "trees-2",
        "name": "Tree Traversals"
      },
      {
        "id": "trees-3",
        "name": "Tree Properties"
      },
      {
        "id": "trees-4",
        "name": "Tree Views"
      },
      {
        "id": "trees-5",
        "name": "Tree Path Problems"
      },
      {
        "id": "trees-6",
        "name": "Binary Search Tree"
      },
      {
        "id": "trees-7",
        "name": "Tree Construction"
      },
      {
        "id": "trees-8",
        "name": "Lowest Common Ancestor"
      },
      {
        "id": "trees-9",
        "name": "Advanced Tree Problems"
      }
    ]
  },
  {
    "id": "binary-search",
    "name": "Binary Search",
    "icon": "⌕",
    "subtopics": [
      {
        "id": "binary-search-1",
        "name": "Binary Search Basics"
      },
      {
        "id": "binary-search-2",
        "name": "Lower Bound"
      },
      {
        "id": "binary-search-3",
        "name": "Upper Bound"
      },
      {
        "id": "binary-search-4",
        "name": "Search in Rotated Array"
      },
      {
        "id": "binary-search-5",
        "name": "Binary Search on Answer"
      },
      {
        "id": "binary-search-6",
        "name": "Search in 2D Matrix"
      },
      {
        "id": "binary-search-7",
        "name": "Advanced Binary Search"
      }
    ]
  },
  {
    "id": "heap",
    "name": "Heap / Priority Queue",
    "icon": "△",
    "subtopics": [
      {
        "id": "heap-1",
        "name": "Heap Basics"
      },
      {
        "id": "heap-2",
        "name": "Min Heap"
      },
      {
        "id": "heap-3",
        "name": "Max Heap"
      },
      {
        "id": "heap-4",
        "name": "Priority Queue"
      },
      {
        "id": "heap-5",
        "name": "Top K Problems"
      },
      {
        "id": "heap-6",
        "name": "Kth Largest / Smallest"
      },
      {
        "id": "heap-7",
        "name": "Merge K Problems"
      },
      {
        "id": "heap-8",
        "name": "Median Problems"
      },
      {
        "id": "heap-9",
        "name": "Heap Design Problems"
      }
    ]
  },
  {
    "id": "graphs",
    "name": "Graphs",
    "icon": "◎",
    "subtopics": [
      {
        "id": "graphs-1",
        "name": "Graph Representation"
      },
      {
        "id": "graphs-2",
        "name": "BFS"
      },
      {
        "id": "graphs-3",
        "name": "DFS"
      },
      {
        "id": "graphs-4",
        "name": "Connected Components"
      },
      {
        "id": "graphs-5",
        "name": "Cycle Detection"
      },
      {
        "id": "graphs-6",
        "name": "Bipartite Graph"
      },
      {
        "id": "graphs-7",
        "name": "Topological Sort"
      },
      {
        "id": "graphs-8",
        "name": "Shortest Path"
      },
      {
        "id": "graphs-9",
        "name": "Dijkstra"
      },
      {
        "id": "graphs-10",
        "name": "Bellman-Ford"
      },
      {
        "id": "graphs-11",
        "name": "Floyd-Warshall"
      },
      {
        "id": "graphs-12",
        "name": "Minimum Spanning Tree"
      },
      {
        "id": "graphs-13",
        "name": "Prim's Algorithm"
      },
      {
        "id": "graphs-14",
        "name": "Kruskal's Algorithm"
      },
      {
        "id": "graphs-15",
        "name": "Disjoint Set Union"
      },
      {
        "id": "graphs-16",
        "name": "Advanced Graph Problems"
      }
    ]
  },
  {
    "id": "greedy",
    "name": "Greedy",
    "icon": "↗",
    "subtopics": [
      {
        "id": "greedy-1",
        "name": "Greedy Basics"
      },
      {
        "id": "greedy-2",
        "name": "Activity Selection"
      },
      {
        "id": "greedy-3",
        "name": "Interval Scheduling"
      },
      {
        "id": "greedy-4",
        "name": "Fractional Knapsack"
      },
      {
        "id": "greedy-5",
        "name": "Job Scheduling"
      },
      {
        "id": "greedy-6",
        "name": "Jump Problems"
      },
      {
        "id": "greedy-7",
        "name": "Gas Station"
      },
      {
        "id": "greedy-8",
        "name": "Huffman Coding"
      },
      {
        "id": "greedy-9",
        "name": "Advanced Greedy"
      }
    ]
  },
  {
    "id": "dp",
    "name": "Dynamic Programming",
    "icon": "◫",
    "subtopics": [
      {
        "id": "dp-1",
        "name": "DP Basics"
      },
      {
        "id": "dp-2",
        "name": "1D DP"
      },
      {
        "id": "dp-3",
        "name": "2D DP"
      },
      {
        "id": "dp-4",
        "name": "Grid DP"
      },
      {
        "id": "dp-5",
        "name": "Knapsack"
      },
      {
        "id": "dp-6",
        "name": "Subsequence DP"
      },
      {
        "id": "dp-7",
        "name": "String DP"
      },
      {
        "id": "dp-8",
        "name": "Partition DP"
      },
      {
        "id": "dp-9",
        "name": "Interval DP"
      },
      {
        "id": "dp-10",
        "name": "DP on Trees"
      },
      {
        "id": "dp-11",
        "name": "DP with Bitmask"
      },
      {
        "id": "dp-12",
        "name": "Advanced DP"
      }
    ]
  },
  {
    "id": "trie",
    "name": "Trie",
    "icon": "⌘",
    "subtopics": [
      {
        "id": "trie-1",
        "name": "Trie Basics"
      },
      {
        "id": "trie-2",
        "name": "Prefix Search"
      },
      {
        "id": "trie-3",
        "name": "Word Search"
      },
      {
        "id": "trie-4",
        "name": "Autocomplete Problems"
      },
      {
        "id": "trie-5",
        "name": "Bitwise Trie"
      },
      {
        "id": "trie-6",
        "name": "Advanced Trie"
      }
    ]
  },
  {
    "id": "bit",
    "name": "Bit Manipulation",
    "icon": "◈",
    "subtopics": [
      {
        "id": "bit-1",
        "name": "AND / OR / XOR"
      },
      {
        "id": "bit-2",
        "name": "Bit Shifting"
      },
      {
        "id": "bit-3",
        "name": "Set Bit"
      },
      {
        "id": "bit-4",
        "name": "Clear Bit"
      },
      {
        "id": "bit-5",
        "name": "Toggle Bit"
      },
      {
        "id": "bit-6",
        "name": "Count Set Bits"
      },
      {
        "id": "bit-7",
        "name": "Power of Two"
      },
      {
        "id": "bit-8",
        "name": "Bitmasking"
      },
      {
        "id": "bit-9",
        "name": "Advanced Bit Manipulation"
      }
    ]
  },
  {
    "id": "sliding-window",
    "name": "Sliding Window",
    "icon": "□",
    "subtopics": [
      {
        "id": "sliding-window-1",
        "name": "Fixed Window"
      },
      {
        "id": "sliding-window-2",
        "name": "Variable Window"
      },
      {
        "id": "sliding-window-3",
        "name": "Frequency-Based Window"
      },
      {
        "id": "sliding-window-4",
        "name": "Longest Substring Problems"
      },
      {
        "id": "sliding-window-5",
        "name": "Minimum Window Problems"
      },
      {
        "id": "sliding-window-6",
        "name": "Advanced Sliding Window"
      }
    ]
  },
  {
    "id": "two-pointers",
    "name": "Two Pointers",
    "icon": "↔",
    "subtopics": [
      {
        "id": "two-pointers-1",
        "name": "Opposite Direction"
      },
      {
        "id": "two-pointers-2",
        "name": "Same Direction"
      },
      {
        "id": "two-pointers-3",
        "name": "Fast / Slow Pointer"
      },
      {
        "id": "two-pointers-4",
        "name": "Pair Problems"
      },
      {
        "id": "two-pointers-5",
        "name": "Triplet Problems"
      },
      {
        "id": "two-pointers-6",
        "name": "Array Partitioning"
      },
      {
        "id": "two-pointers-7",
        "name": "Advanced Two Pointer Problems"
      }
    ]
  },
  {
    "id": "divide-conquer",
    "name": "Divide & Conquer",
    "icon": "÷",
    "subtopics": [
      {
        "id": "divide-conquer-1",
        "name": "Merge Sort"
      },
      {
        "id": "divide-conquer-2",
        "name": "Quick Sort"
      },
      {
        "id": "divide-conquer-3",
        "name": "Binary Search"
      },
      {
        "id": "divide-conquer-4",
        "name": "Divide and Conquer Arrays"
      },
      {
        "id": "divide-conquer-5",
        "name": "Divide and Conquer Trees"
      },
      {
        "id": "divide-conquer-6",
        "name": "Advanced Problems"
      }
    ]
  },
  {
    "id": "advanced",
    "name": "Advanced DSA",
    "icon": "◇",
    "subtopics": [
      {
        "id": "advanced-1",
        "name": "Disjoint Set Union"
      },
      {
        "id": "advanced-2",
        "name": "Segment Tree"
      },
      {
        "id": "advanced-3",
        "name": "Fenwick Tree"
      },
      {
        "id": "advanced-4",
        "name": "Sparse Table"
      },
      {
        "id": "advanced-5",
        "name": "Advanced Graphs"
      },
      {
        "id": "advanced-6",
        "name": "Advanced Trees"
      },
      {
        "id": "advanced-7",
        "name": "Advanced String Algorithms"
      },
      {
        "id": "advanced-8",
        "name": "Advanced Data Structures"
      }
    ]
  }
]
