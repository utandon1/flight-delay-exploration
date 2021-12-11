import csv
import numpy as np
import json

airports = []
counter = 0


'''
with open('../archive/airports.csv', newline='') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		if counter > 0:
			airports.append(row[0])
		counter += 1
'''

airports = ['DFW', 'CLT', 'OAK', 'MSY', 'FLL', 'ATL', 'DTW', 'CLE', 'SAN', 'RDU', 'JFK', 'PIT', 'PDX', 'BNA', 'EWR', 'LAX', 'BOS', 'LAS', 'AUS', 'ONT', 'SFO', 'TPA', 'DCA', 'MDW', 'MIA', 'HOU', 'ORD', 'BWI', 'CVG', 'SMF', 'SLC', 'DEN', 'SNA', 'SEA', 'SAT', 'MCI', 'LGA', 'MSP', 'DAL', 'STL', 'MEM', 'IND', 'MCO', 'IAD', 'SJC', 'IAH', 'ABQ', 'PHL', 'MKE', 'PHX']

matrix = np.zeros((len(airports), len(airports)))
counts = np.zeros((len(airports), len(airports)))

counter = 0
with open('../archive/flights.csv', newline='') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		if counter > 0:
			orig = row[7]
			dest = row[8]
			if orig not in airports or dest not in airports:
				continue
			o_ind = airports.index(orig)
			d_ind = airports.index(dest)

			delay = row[22]

			if delay and int(delay) > 0:
				matrix[o_ind][d_ind] += 1

			counts[o_ind][d_ind] += 1
		if counter % 100000 == 0:
			print (counter)
		counter += 1

'''
normalized = matrix / counts

normalized = np.nan_to_num(normalized)

normalized = normalized * 100
'''

data = {}

data["matrix"] = matrix.tolist()

with open('chord_new2.json', 'w') as f:
    json.dump(data, f)