import numpy as np
q = np.array([0.1,0.5,0.4,0.3])

r_1 = np.array([0.2,0.3,0.1,0.9])
r_2 = np.array([0.5,0.3,0.7,0.8])
r_3 = np.array([0.2,0.4,0.15,0.7])
r_4 = np.array([0.3,0.2,0.1,0.4])



from numpy import dot
from numpy.linalg import norm

print(dot(q, r_1)/(norm(q)*norm(r_1)))
print(dot(q, r_2)/(norm(q)*norm(r_2)))
print(dot(q, r_3)/(norm(q)*norm(r_3)))
print(dot(q, r_4)/(norm(q)*norm(r_4)))
