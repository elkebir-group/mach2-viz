import os
import sys


# check for directory name
if len(sys.argv) != 2:
    print("format: python change_format.py [directory]")
    exit()

dir_name = sys.argv[1]
patient_name = dir_name.split("/")[-1]

SEARCH_DIR = dir_name + "/potential_labelings/"
MOVE_DIR = dir_name + "_new/"
TREE_FILE = patient_name + ".tree"


# retrieve directory contents
dir_contents = None
try:
    dir_contents = os.listdir(sys.argv[1])
except:
    print("error: directory not found!")
    exit()


# checking whether necessary transformation info exists

if "potential_labelings" not in dir_contents:
    print("error: potential_labelings not found")
    exit()

if TREE_FILE not in dir_contents:
    print("error: " + patient_name + ".tree not found")
    exit()

os.system("mkdir " + dir_name + "_new")


# iterating through potential labelings

for labeling in os.listdir(SEARCH_DIR):
    os.system("cp " + SEARCH_DIR + labeling + " " + MOVE_DIR)
    os.system("cp " + dir_name + "/" + TREE_FILE + " " + MOVE_DIR)
    os.system("mv " + MOVE_DIR + TREE_FILE + " " + MOVE_DIR + labeling.split(".")[0] + ".tree")

os.system("rm -rf " + dir_name)
os.system("mv " + MOVE_DIR + " " + dir_name)