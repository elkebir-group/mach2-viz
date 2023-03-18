import os
import sys
import json

# check for directory name
if len(sys.argv) != 2:
    print("format: python json_compression.py [directory_path]")
    exit()

dir_name = sys.argv[1]

# retrieve directory contents
dir_contents = None
try:
    dir_contents = os.listdir(sys.argv[1])
except:
    print("error: directory not found!")
    exit()

patient_name = dir_name.split("/")[-1]

# error-checking dir_contents
if patient_name + ".tree" not in dir_contents:
    print("error: clone tree structure (" + patient_name + ".tree) not found")
    exit()

if patient_name + ".labeling" not in dir_contents:
    print("error: main clone tree labeling (" + patient_name + ".labeling) not found")
    exit()

if "coloring.txt" not in dir_contents:
    print("error: coloring guide (coloring.txt) not found")
    exit()

if "pmh" not in dir_contents:
    print("error: migration graph labelings (pmh) not found")
    exit()

if "potential_labelings" not in dir_contents:
    print("error: clone tree labeling options (potential_labelings) not found")
    exit()


# extract patient data from directory
patient_data = {}

# extract patient name
patient_data["name"] = sys.argv[1]

# extract migration graph data
# migration_graphs = []
# potential_graphs = {}
# filenames = os.listdir(dir_name + "/pmh")
# for filename in filenames:
#     file_breakdown = filename.split(".")
#     try:
#         potential_graphs[file_breakdown[0]].append(file_breakdown[1])
#     except:
#         potential_graphs[file_breakdown[0]] = [file_breakdown[1]]

# for graph_name in potential_graphs:
#     if "tree" in potential_graphs[graph_name] and "labeling" in potential_graphs[graph_name]:
#         graph_item = {}
#         graph_item["name"] = graph_name

#         with open(dir_name + "/pmh/" + graph_name + ".tree") as f:
#             node_pairings = f.readlines()
#             graph = []

#             for pairing in node_pairings:
#                 pairing = pairing[:-1] if pairing[-1] == "\n" else pairing
#                 graph.append(pairing.split(" "))

#             graph_item["graph"] = graph
        
#         with open(dir_name + "/pmh/" + graph_name + ".labeling") as f:
#             labelings = f.readlines()
#             labeling = []

#             for label in labelings:
#                 label = label[:-1] if label[-1] == "\n" else label
#                 labeling.append(label.split(" "))

#             graph_item["labeling"] = labeling
        
#         migration_graphs.append(graph_item)

# patient_data["migration_graph"] = migration_graphs


# extract clone tree data
clone_tree = {}
with open(dir_name + "/" + patient_name + ".tree") as f:
    node_pairings = f.readlines()
    tree = []

    for pairing in node_pairings:
        pairing = pairing[:-1] if pairing[-1] == "\n" else pairing
        tree.append(pairing.split(" "))
    
    clone_tree["tree"] = tree

# with open(dir_name + "/" + patient_name + ".labeling") as f:
#     labelings = f.readlines()
#     labeling = []

#     for label in labelings:
#         label = label[:-1] if label[-1] == "\n" else label
#         labeling.append(label.split(" "))
    
#     clone_tree["labeling"] = labeling

full_labelings = []
potential_labelings = os.listdir(dir_name + "/potential_labelings")
for filename in potential_labelings:
    labeling_item = {}
    labeling_item["name"] = filename.split(".")[0]

    with open(dir_name + "/potential_labelings/" + filename) as f:
        labelings = f.readlines()
        labeling = []

        for label in labelings:
            label = label[:-1] if label[-1] == "\n" else label
            labeling.append(label.split(" "))
        
        labeling_item["data"] = labeling
        full_labelings.append(labeling_item)

clone_tree["labeling"] = full_labelings

patient_data["clone_tree"] = clone_tree


# extract coloring data
colorings = []
with open(dir_name + "/coloring.txt") as f:
    coloring_pairings = f.readlines()

    for pairing in coloring_pairings:
        pairing = pairing[:-1] if pairing[-1] == "\n" else pairing
        colorings.append(pairing.split(" "))
    
patient_data["coloring"] = colorings

# write json object to a json file
with open(dir_name + "/" + patient_name + ".json", "w") as f:
    f.write(json.dumps(patient_data, indent=4))
