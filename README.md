# MACHINA-Viz
Visualizing the solution space for the 

## JSON-Compression
MACHINA-Viz takes file inputs in a json file format. The json is in the following format:
```json
{
  "name": <patient name>,
  "solutions": [
    {
      "name": <solution name>,
      "tree": [
        [u, v],
        ...
      ],
      "labeling": [
        [n, label],
        ...
      ],
      "migration": [
        [label_u, label_v, # occurences],
        ...
      ]
    },
    ...
  ],
  "summary": {
    "migration": [
      [label_u, label_v, # occurences],
      ...
    ]
  }
}
```
In a given solution, $u$ and $v$ are node IDs in a solution's clonal tree, $n$ is a clonal tree node ID, and $label$ is the anatomical labeling for $n$. 
