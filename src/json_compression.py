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

if "potential_labelings" not in dir_contents:
    os.system("python3 json_compression_2.py " + dir_name)
    exit(0)


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


# extract patient data from directory
patient_data = {}


# extract patient name
patient_data["name"] = sys.argv[1]


# extract clone tree data
clone_tree = {}
with open(dir_name + "/" + patient_name + ".tree") as f:
    node_pairings = f.readlines()
    tree = []

    for pairing in node_pairings:
        pairing = pairing[:-1] if pairing[-1] == "\n" else pairing
        tree.append(pairing.split(" "))
    
    clone_tree["tree"] = tree


full_labelings = []
potential_labelings = os.listdir(dir_name + "/potential_labelings")
potential_labelings = sorted(potential_labelings)
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
