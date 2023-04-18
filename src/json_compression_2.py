from asyncio import DatagramTransport
import os
import sys
import json

# check for directory name
if len(sys.argv) != 2:
    print("format: python json_compression_2.py [directory_path]")
    exit()

loc_arg = sys.argv[1]

# retrieve directory contents
dir_contents = None
try:
    dir_contents = os.listdir(sys.argv[1])
except:
    print("error: directory not found!")
    exit()

patient_name = loc_arg.split("/")[-1]


# extract patient data from directory
patient_data = {}


# extract patient name
patient_data["name"] = patient_name


# get existing file types for all sites
data_tracker = {}
for filename in os.listdir(loc_arg):
    site = ".".join(filename.split(".")[:-1])
    type = filename.split(".")[-1]

    try:
        data_tracker[site].add(type)
    except:
        data_tracker[site] = set()
        data_tracker[site].add(type)


# separating tree/labeling data into patient dictionary
solution_tracker = []

for data in sorted(data_tracker.keys()):
    if "tree" in data_tracker[data] and "labeling" in data_tracker[data]:
        curr_obj = {}
        curr_obj["name"] = data

        tree = []
        with open(loc_arg + "/" + data + ".tree") as f:
            tree_data = f.readlines()
            
            for item in tree_data:
                item_vals = (item[:-1] if item[-1] == '\n' else item).split(" ") 
                tree.append(item_vals)
        
        curr_obj["tree"] = tree

        labeling = []
        with open(loc_arg + "/" + data + ".labeling") as f:
            labeling_data = f.readlines()

            for item in labeling_data:
                item_vals = (item[:-1] if item[-1] == '\n' else item).split(" ")
                labeling.append(item_vals)
        
        curr_obj["labeling"] = labeling

        solution_tracker.append(curr_obj)


patient_data["solutions"] = solution_tracker

# write json object to a json file
with open(loc_arg + "/" + patient_name + ".json", "w") as f:
    f.write(json.dumps(patient_data, indent=4))
