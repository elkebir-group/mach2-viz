# Summary View

When you open up a sumary panel by clicking the `+` bar on the left from either a single or dual panel viz, you will see one of the screens below:

![sum-viz](../figures/sum-viz.jpeg)
![tri-viz](../src/assets/sample_page.png)
*Summary panel views in MACH2-Viz. To enter the three panel view (bottom) from the dual summary panel view (top). Simply click the `+` bar in the right.*

## Basic Functionality

You can perform the single and double panel functions as normal with the solution solution panel(s) in the right.
  
### The Summary Graph

The summary graph is a collection of all solutions' migration graphs unioned into a single graph. Each edge is a migration that exists somewhere in the provided solution space, and each edge is weighted by the number of solutions the migration appears in.
  
In the top left corner of the summary graph panel, you will see the number of available solutions. Any edit on the graph can be reset using the `reset` button.
  
You can hover over nodes and edges in the summary graph and see highlighting correspondence in the individual solutions in the panel(s) on the right. Vice versa, if you hover over nodes and edges in the individual solutions, you will see highlighting correspondence in the summary graph.

![hover-sum](../figures/hover-sum.jpeg)
*My mouse is hovering over the `lung` node in the summary graph. The corresponding nodes and edges are highlighting on the right side as well.*