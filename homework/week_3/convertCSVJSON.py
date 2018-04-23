# convertCSVJSON.py
#
# DataProcessing week 3
# Shan Shan Huang (10768793)
#
# Converts csv file of US gunlaws scores into a JSON file.

import csv
import json

csv_rows = []

# iterate over csv file
with open ('US_gunlaw.csv', 'r') as csvfile:

	# store every dictionary {'State_code' : 'Score'} in list
	reader = csv.DictReader(csvfile)

	for row in reader:
		# csv_rows.append(row)

		key_value = {row['State Code']:row['Score']}
		csv_rows.append(key_value)

datadict = {'data': csv_rows}

# convert csvdata to jsondata
with open ('US_gunlaw.json', 'w') as jsonfile:
	json.dump(datadict, jsonfile)