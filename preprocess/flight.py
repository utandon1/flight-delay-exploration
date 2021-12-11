import csv
import numpy as np
import json
from collections import defaultdict

'''

header = ["origin", "destination", "count", "delay"]
counter = 0

counts = {}
flights = {}

airports = []
with open('../archive/airports.csv', newline='') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		if counter > 0:
			airports.append(row[0])
		counter += 1
'''

counter = 0
with open('../archive/flights.csv', newline='') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		if counter > 0:
			orig = row[7]
			dest = row[8]

			print (row[0], row[1], orig)

			'''
			if orig in airports and dest in airports:
				key = orig + " " + dest
				if key in counts:
					counts[key] += 1
				else:
					counts[key] = 1

				delay = row[22]

				if delay and int(delay) > 0:
					if key in flights:
						flights[key] += 1
					else:
						flights[key] = 1
			'''
		counter += 1

'''
rows_new = []

rows_new.append(header)
for path in flights:
	p = path.split()
	row_new = [p[0], p[1], counts[path], flights[path]]
	rows_new.append(row_new)

with open('flight_new.csv', 'w') as csvfile:
    writer = csv.writer(csvfile)
    for row in rows_new:
    	writer.writerow(row)

'''
