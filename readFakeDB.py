import sys
#print("HI from python")


if int(sys.argv[1]) == 0:
    f = open("db.txt", "r")
    print(f.read())
elif  int(sys.argv[1]) == 1:
    f = open("db.txt", "w")
    f.write(sys.argv[2])
elif  int(sys.argv[1]) == 2:
    f = open("db.txt", "a")
    f.write(sys.argv[2])


def readDB(arg):
    
    print("HI FROM FUNCCTION")
    print("PY:",arg)
    f = open("db.txt", "r")
    return f.read()



#readDB("THIE SI SA TEST")