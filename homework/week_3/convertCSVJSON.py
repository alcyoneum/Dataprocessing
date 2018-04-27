# convertCSVJSON.py
#
# DataProcessing week 3
# Shan Shan Huang (10768793)
#
# Converts csv file into a JSON file.

import csv
import json

csv_rows = []

# iterate over csv file
with open ("expenses_mentalcare.csv", "r") as csvfile:

	# store every dictionary {'State_code' : 'Score'} in list
	reader = csv.DictReader(csvfile)

	for row in reader:
		csv_rows.append(row)

datadict = {"data": csv_rows}

# convert csvdata to jsondata
with open ("expenses_mentalcare.json", "w") as jsonfile:
	json.dump(datadict, jsonfile)