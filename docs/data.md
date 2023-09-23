# Writing JSON for MACH2-Viz

[Back](documentation.md)

- [Writing JSON for MACH2-Viz](#writing-json-for-mach2-viz)
  - [General format](#general-format)
    - [Required Field Descriptions](#required-field-descriptions)
  - [Visualizing the Input Tree](#visualizing-the-input-tree)
    - [Including the Input Tree](#including-the-input-tree)
    - [Multiple Input Trees](#multiple-input-trees)
    - [Origin Node Mapping](#origin-node-mapping)
  - [(WIP) Temporality](#wip-temporality)
  - [JSON Compression](#json-compression)
  
## General format

When uploading a JSON, the required parameters are the following:

```json
{
    "name": "example",
    "solutions": [
        {
            "name": "soln_name1",
            "tree": [
                ["u", "v"],
                // ...
            ],
            "labeling": [
                ["u", "u_label"],
                ["v", "v_label"],
                // ...
            ],
            "migration": [
                ["u_label", "v_label"],
                // ...
            ]
        },
        // ...
    ],
    "summary": [
        [
            "u_label",
            "v_label",
            3 // some 'weight' value
        ]
    ]
}
```

### Required Field Descriptions

- `"name" (string)`: The name of the patient
- `"solutions" (list)`: The list of solutions. Each solution is an object with the following fields:
  - `"name" (string)`: The name of the solution
  - `"tree" (list)`: The clonal tree topology. This is an edge-list where each node is a string id of a clone.
  - `"labeling" (list)`: This is an array where each element is a pair of two (a 2-array) with the format [node, label]. This is a mapping between the clone id and its anatomical location.
  - `"migration" (list)`: This is the edge-list of the migration graph. Each edge goes from an anatomical site to another anatomical site.
- `"summary" (list)`: This is a weighted edge list. Each edge goes from anatomical site to another anatomical site, and the weightage is the number of solutions this edge appears in.

These are the required parameters for which an input for the MACH2-Viz should have at the minimum. For more in depth visualizations, there are optional parameters that can be included in the dataset.

## Visualizing the Input Tree

### Including the Input Tree

To include the input tree. You simply add a field `"original"` to the json. It is in a format as follows:

```json
"original": {
    "tree": [
        ["u", "v"],
        //...
    ],
    "labeling": [
        ["leaf_node", "leaf_label"],
        //...
    ]
}
```

In the `"tree"` field, you have the edgelist for the original clone tree where every node is a clone id. In the `"lableing"` field, there are anatomical labelings for the leaves (the current state) of the input clonal tree.

See [A10](../src/samples/A10/A10.json) [lines 3-92] for a real example.

### Multiple Input Trees

If your data has multiple possible input trees for a single patient, then your `"original"` field will need to be an array:

```json
"original": [
    {
        "tree": [
            ["u", "v"],
            //...
        ],
        "labeling": [
            ["leaf_node", "leaf_label"],
            //...
        ]
    },
    {
        //...
    },
    //...
]
```

See [A1](../src/samples/A1/A1.json) [lines 3-256] for a real example.

### Origin Node Mapping

Polytomy refinement is the extension of a node with more than one child into a subtree such that nodes have less children each.

```text
   A             A
 / | \   --->   / \
B  C  D        B   A^1
                   / \
                  C   D
```

If your solutions perform polytomy refinement on the input tree, you might want to visualize correspondence between clones in the input tree and clones in the refined tree. To indicate this mapping, in each solution entry, there needs to be an `"origin_node"` field.

```json
"solutions": [
    {
        "name": "soln",
        "tree": [
            ["A", "B"],
            ["A", "A^1"],
            ["A^1", "C"],
            ["A^!", "D"]
        ],
        "labeling": [
            //...
        ],
        "origin_node": [
            ["A", "A"],
            ["A^1", "A"],
            ["B", "B"],
            ["C", "C"],
            ["D", "D"]
        ]
    }
]
```

As you can see, the `"origin_node"` field maps nodes in the output to nodes in the input. Both `"A"` and `"A^1"` maps to `"A"` in the input. All other nodes in the example maps to themselves as they were not refined from the input.

## (WIP) Temporality

**NOTE: This feature is still being developed. We hope to have animated tree and migration graph growths with timestamped data.**
  
Optionally, you can add a temporal element to clonal tree and migration edges. This third element, or 'weightage', on the edges indicate a time step in which the mutation or migration may have happened. Consider the example in [A1.json](../src/samples/A1/A1.json).

```json
"migration": [
    [
        "adrenal",
        "liver",
        2
    ],
    [
        "breast",
        "lung",
        1
    ],
]
```
  
```json
"tree": [
    [
        "2^breast",
        "2^adrenal",
        3
    ],
    [
        "2^breast",
        "2_breast",
        -1
    ],
    [
        "2^adrenal",
        "7",
        4
    ]
]
```
  
From this data, we can see that the metastasis from the adrenal gland to the liver happened after the breast to lung migration. In this data, intra-tumor mutations aren't being timestamped (hence -1). However, we see that the mutation from the `2^breast` to the `2^adrenal` clone happens before `2^adrenal` to `7`.

## JSON Compression

MACH2 already outputs JSON in this format by nature, but if you are using another software designed for migration history inference, you will need to compile the outputs from your output in this format.
  
MACH2-Viz is backwards compatible with MACHINA outputs. If you are using [MACHINA](https://github.com/raphael-group/machina) for Parsimonious Migration History (PMH) inference, you can use the [JSON compression tool](https://github.com/vikramr2/json_compression) to quickly construct outputs for MACH2-Viz.
