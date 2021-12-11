import csv
import numpy as np
import json
from collections import defaultdict



header = ["origin", "destination", "count", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
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

counter = 0
month_reason = np.zeros((12, 3))
month_reason_del = np.zeros((12, 4))
with open('../archive/flights.csv', newline='') as csvfile:
	reader = csv.reader(csvfile)
	for row in reader:
		if counter > 0:
			month = int(row[1]) - 1
			air_sys = row[26]
			security = row[27]
			airline = row[28]
			aircraft = row[29]
			weather = row[30]
			orig = row[7]
			dest = row[8]
			cancel = row[24]
			cancel_reason = row[25]

			if orig in airports and dest in airports:
				key = orig + " " + dest

				delay = row[22]

				if key in counts:
					counts[key] += 1
				else:
					counts[key] = 1
				

				if delay and int(delay) > 0 and air_sys:
					key = orig + " " + dest

					arr = np.array([int(weather), int(airline), int(aircraft), int(air_sys)])
					max_ind = arr.argmax()
					newa = np.zeros(4)
					newa[max_ind] = 1
					month_reason_del[month] += newa

					'''
					if key in flights:
						flights[key][month] += np.array([int(air_sys), int(security), int(airline), int(aircraft), int(weather)])
					else:
						flights[key] = np.zeros((12,5))#[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]]
						flights[key][month] += np.array([int(air_sys), int(security), int(airline), int(aircraft), int(weather)])
					'''	
				
				if int(cancel):
					key = orig + " " + dest

					add_array = np.zeros(3)
					if cancel_reason == "A":
						add_array[0] = 1
					if cancel_reason == "B":
						add_array[1] = 1
					if cancel_reason == "C":
						add_array[2] = 1

					month_reason[month] += add_array

					if key in flights:
						flights[key][month] += add_array
					else:
						flights[key] = np.zeros((12,3))#[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]]
						flights[key][month] += add_array



		counter += 1
'''
[
        { name: 'Current Month',
          axes: [
            {axis: 'Weather', value: 42},
            {axis: 'Airline', value: 60},
            {axis: 'Security', value: 10},
            {axis: 'Air System', value: 26},
            {axis: 'Aircraft', value: 52}
          ],
         color: '#762712'
        }
      ]
'''

all_data = {}

labels = ["Weather", "Airline", "Aircraft", "Air System"]
labels = ["Airline", "Weather", "Air System"]

for i in range(12):
	all_data[i] = [];
	dict_load = {"name": i, "axes": [], "color": '#762712'}
	for j in range(len(labels)):
		dict_load["axes"].append({"axis": labels[j], "value": month_reason[i][j]})
	all_data[i].append(dict_load)

with open('radar.json', 'w') as f:
    json.dump(all_data, f)


rs = []
hd = ["month", "wcancel", "wdelay"]
rs.append(hd)


for i in range(12):
	r = []
	r.append(i)
	r.append(month_reason[i][1] / np.sum(month_reason[i]))
	r.append(month_reason_del[i][0] / (month_reason_del[i][1] + month_reason_del[i][3]))
	rs.append(r)


with open('weather_comp.csv', 'w') as csvfile:
    writer = csv.writer(csvfile)
    for row in rs:
    	writer.writerow(row)
	

'''
with open('lollipop_month.csv', 'w') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["month", "air"])
    for i in range(len(months)):
    	writer.writerow([i, month_norm[i]])
'''


rows_new = []

rows_new.append(header)
for path in flights:
	p = path.split()
	row = []
	row.append(p[0])
	row.append(p[1])
	row.append(counts[path])
	for i in range(12):
		reasons = flights[path][i]
		if not reasons.any():
			row.append(10)
		else:
			row.append(reasons.argmax())
	rows_new.append(row)

with open('weather.csv', 'w') as csvfile:
    writer = csv.writer(csvfile)
    for row in rows_new:
    	writer.writerow(row)


