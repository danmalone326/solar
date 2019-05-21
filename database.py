#!/usr/bin/python
import sqlite3
from datetime import datetime, timedelta

databaseFileName='solarData.db'

dateOnlyFormat='%Y-%m-%d'
datetimeFormat='%Y-%m-%d %H:%M:%S'

dbConnection=None
dbCursor=None

# connect to the database
def openDatabase():
    global dbConnection
    if (dbConnection is None):
        dbConnection = sqlite3.connect(databaseFileName)
        dbConnection.text_factory = str
    
def openCursor():
    global dbCursor
    if (dbCursor is None):
        openDatabase()
        dbCursor=dbConnection.cursor()


def getSiteInfo(value):
    openCursor()
    
    dbCursor.execute('''
    SELECT id,name,apiKey,lat,lon
      FROM sites
     WHERE id = ?
        OR name = ?
    ''',(value,value,))

    result = dbCursor.fetchone()
    
    if (result is None):
        siteInfo = {}
    else:
        siteInfo = {"id": result[0], 
                    "name": result[1], 
                    "apiKey": result[2], 
                    "lat": result[3], 
                    "lon": result[4]}
            
    return siteInfo

def setSiteInfo(siteInfo):
    openCursor()
    
    dbCursor.execute('''
    DELETE FROM sites 
     WHERE id=?
    ''', (siteInfo['id'],))

    dbCursor.execute('''
    INSERT INTO sites (id,name,apiKey,lat,lon)
           VALUES(?,?,?,?,?)
    ''', (siteInfo["id"],siteInfo["name"],siteInfo["apiKey"],siteInfo["lat"],siteInfo["lon"],))

    dbConnection.commit()


def getSunData(siteInfo):
    openCursor()

    sunData={}
    dbCursor.execute('''
    SELECT date,sunrise,sunset
      FROM sunData
     WHERE siteId = ?
    ''',(siteInfo['id'],))

    result = dbCursor.fetchone()

    if (result is None):
        sunData['date']=None
        sunData['sunrise']=None
        sunData['sunset']=None
    else:
        sunData['date']=datetime.strptime(result[0],dateOnlyFormat).date()
        sunData['sunrise']=datetime.strptime(result[1],datetimeFormat)
        sunData['sunset']=datetime.strptime(result[2],datetimeFormat)

    return sunData

def setSunData(siteInfo,sunData):
    openCursor()

    dbCursor.execute('''
    DELETE FROM sunData 
     WHERE siteId=?
    ''', (siteInfo['id'],))

    dbCursor.execute('''
    INSERT INTO sunData (siteId,date,sunrise,sunset)
           VALUES(?,?,?,?)
    ''', (siteInfo['id'],
          sunData['date'].strftime(dateOnlyFormat),
          sunData['sunrise'].strftime(datetimeFormat),
          sunData['sunset'].strftime(datetimeFormat),))

    dbConnection.commit()

def getOverview(siteInfo,updateTime):
    openCursor()

    dbCursor.execute('''
    SELECT *
      FROM overview
     WHERE siteId=?
       AND lastUpdateTime=?
    ''',(siteInfo['id'],updateTime,))

    overviewRow = dbCursor.fetchone()

    overviewDict={}
    if (overviewRow is not None):
        overviewDict["queryTime"]=overviewRow[1]
        overviewDict["lastUpdateTime"]=overviewRow[2]
        overviewDict["currentPower"]=overviewRow[3]
        overviewDict["lastDayEnergy"]=overviewRow[4]
        overviewDict["lastMonthEnergy"]=overviewRow[5]
        overviewDict["lastYearEnergy"]=overviewRow[6]
        overviewDict["lifetimeEnergy"]=overviewRow[7]
   
    return overviewDict

def getLastUpdateTime(siteInfo):
    openCursor()

    dbCursor.execute('''
    SELECT max(lastUpdateTime) 
      FROM overview
     WHERE siteId=?
    ''',(siteInfo['id'],))

    result = dbCursor.fetchone()

    if (result is None):
        time=0
    else:
        time=result[0]
    
    return time
    
def getLastOverview(siteInfo):
    maxLastUpdateTime = getLastUpdateTime(siteInfo)
    overviewDict = getOverview(siteInfo,maxLastUpdateTime)
    return overviewDict

def insertOverview(siteInfo,overviewDict):
    openCursor()
    dbCursor.execute('''
    INSERT INTO overview (siteId,queryTime,lastUpdateTime,currentPower,lastDayEnergy,
                          lastMonthEnergy,lastYearEnergy,lifetimeEnergy)
           VALUES(?,?,?,?,?,?,?,?)
    ''', (siteInfo['id'],
          overviewDict["queryTime"],
          overviewDict["lastUpdateTime"],
          overviewDict["currentPower"],
          overviewDict["lastDayEnergy"],
          overviewDict["lastMonthEnergy"],
          overviewDict["lastYearEnergy"],
          overviewDict["lifetimeEnergy"],))

    dbConnection.commit()
