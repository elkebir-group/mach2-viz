# Writing JSON for MACH2-Viz

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

These are the required parameters which an input for the MACH2-Viz should have at the minimum. For more in depth visualizations, there are optional parameters that can be included in the dataset.

## Visualizing the Input Tree

## Temporality
