#!/usr/bin/python
import sqlite3

databaseFileName='solarData.db'

# connect to the database
def connect():
    global dbConnection
    dbConnection = sqlite3.connect(databaseFileName)
    dbConnection.text_factory = str
      
    return dbConnection
