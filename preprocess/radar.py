import csv
import numpy as np
import json



'''
with open('../archive/flights.csv', newline='') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		if counter > 0:

			if delay and int(delay) > 0:
				

			counts[o_ind][d_ind] += 1
		if counter % 100000 == 0:
			print (counter)
		counter += 1
'''
f = open('chord_new.json')

data = json.load(f)
matrix = data["matrix"]

print (matrix[9][4])