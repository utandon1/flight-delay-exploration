import csv
import numpy as np
import json
from collections import defaultdict



header = ["airline", "count", "delay_freq"]

counts = {}
flights = {}

counter = 0

airports = []
with open('../archive/airports.csv', newline='') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		if counter > 0:
			airports.append(row[0])
		counter += 1

counter = 0
with open('../archive/flights.csv', newline='') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		if counter > 0:
			orig = row[7]
			airline = row[4]

			if orig in airports:
				key = airline
				if key in counts:
					counts[key] += 1
				else:
					counts[key] = 1

				delay = row[22]

				if delay and int(delay) > 5:
					if key in flights:
						flights[key] += 1
					else:
						flights[key] = 1


		counter += 1


rows_new = []

rows_new.append(header)
for path in flights:
	row_new = [path, counts[path], flights[path]/float(counts[path])]
	rows_new.append(row_new)

with open('airline_best.csv', 'w') as csvfile:
    writer = csv.writer(csvfile)
    for row in rows_new:
    	writer.writerow(row)