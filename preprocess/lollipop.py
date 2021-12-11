import csv
import numpy as np
import json


counter = 0
airports = []
with open('../archive/airports.csv', newline='') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		if counter > 0:
			airports.append(row[0])
		counter += 1

airports = ["ATL","ORD","DFW","DEN","LAX","SFO","PHX","IAH","LAS","MSP","SEA","DTW","BOS","MCO","EWR","CLT","LGA","SLC","JFK","BWI","MDW","DCA","FLL","SAN","MIA","PHL","TPA","DAL","HOU","PDX","BNA","STL","OAK","AUS","MSY","MCI","SJC","SMF","SNA","CLE","IAD","RDU","MKE","SAT","RSW","IND","CMH","PIT","PBI","CVG"]



counts = {}
flights = {}

matrix = np.zeros((12, len(airports)))
counts = np.zeros((12, len(airports)))

months = np.zeros(12)
totalmonths = np.zeros(12)
counter = 0
with open('../archive/flights.csv', newline='') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		if counter > 0:
			month = int(row[1]) - 1
			orig = row[7]
			dest = row[8]

			if orig in airports:
				o_ind = airports.index(orig)

				delay = row[22]

				if delay and int(delay) > 0:
					months[month] += 1
					matrix[month][o_ind] += 1

				totalmonths[month] += 1
				counts[month][o_ind] += 1
		if counter % 100000 == 0:
			print (counter)
		counter += 1

month_norm = months / totalmonths
month_norm = np.nan_to_num(month_norm)

with open('lollipop_month.csv', 'w') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["month", "delay_freq"])
    for i in range(len(months)):
    	writer.writerow([i, month_norm[i]])



normalized = matrix / counts
normalized = np.nan_to_num(normalized)


airportjson = {}

for i in range(12):
	airportjson[i] = []
	for j in range(len(matrix[i])):
		airport = airports[j]
		point = {}
		point["airport"] = airport
		point["delayperc"] = normalized[i][j]
		airportjson[i].append(point)


with open('lollipop_airport.json', 'w') as f:
    json.dump(airportjson, f)





