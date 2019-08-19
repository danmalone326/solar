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
    SELECT date,sunrise,sunset,tzOffset
      FROM sunData
     WHERE siteId = ?
    ''',(siteInfo['id'],))

    for row in dbCursor:
        tempDate=row[0]
        sunData[tempDate]={}
        sunData[tempDate]['sunrise']=row[1]
        sunData[tempDate]['sunset']=row[2]
        sunData[tempDate]['tzOffset']=row[3]

    return sunData

def setSunData(siteInfo,sunData):
    openCursor()

    dbCursor.execute('''
    DELETE FROM sunData 
     WHERE siteId=?
    ''', (siteInfo['id'],))

    for thisDate in sunData:
        thisSunData = sunData[thisDate]
        
        dbCursor.execute('''
        INSERT INTO sunData (siteId,date,sunrise,sunset,tzOffset)
               VALUES(?,?,?,?,?)
        ''', (siteInfo['id'],
              thisDate,
              thisSunData['sunrise'],
              thisSunData['sunset'],
              thisSunData['tzOffset'],))

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

def getClosestOverview(siteInfo,dateStr):
    openCursor()

    dbCursor.execute('''
    SELECT max(lastUpdateTime)
      FROM overview
     WHERE siteId=?
       AND lastUpdateTime<=?
    ''',(siteInfo['id'],dateStr,))

    row = dbCursor.fetchone()
    
    if (row is None):
        result={}
    else:
        result=getOverview(siteInfo,row[0])
    
    return result

def getCurrentBetween(siteInfo,fromDateStr,toDateStr):
    openCursor()

    dbCursor.execute('''
    SELECT lastUpdateTime,
           currentPower
      FROM overview
     WHERE siteId=?
       AND lastUpdateTime>=?
       AND lastUpdateTime<=?
    ''',(siteInfo['id'],fromDateStr,toDateStr,))

    tempDict={}

    for row in dbCursor:
        tempDict[row[0]]=row[1]
   
    return tempDict

def getAverageDayValues(siteInfo,fromDateStr,toDateStr):
    openCursor()

# select substr(lastUpdateTime,1,10),max(lastDayEnergy) from overview group by substr(lastUpdateTime,1,10);
    dbCursor.execute('''
        SELECT max(energy) maxEnergy,
               avg(energy) avgEnergy,
               max(peakPower) maxPeakPower,
               avg(peakPower) avgPeakPower
          FROM (
            SELECT substr(lastUpdateTime,1,10),
                   max(lastDayEnergy) energy,
                   max(currentPower) peakPower
              FROM overview
             WHERE siteId=?
               AND lastUpdateTime>=?
               AND lastUpdateTime<=?
             GROUP BY substr(lastUpdateTime,1,10)
                )
    ''',(siteInfo['id'],fromDateStr,toDateStr,))

    row = dbCursor.fetchone()

    tempDict={}
    tempDict['maxEnergy']=row[0]
    tempDict['avgEnergy']=row[1]
    tempDict['maxPeakPower']=row[2]
    tempDict['avgPeakPower']=row[3]
    
    return tempDict


def getDailyBetween(siteInfo,fromDateStr,toDateStr):
    openCursor()

# select substr(lastUpdateTime,1,10),max(lastDayEnergy) from overview group by substr(lastUpdateTime,1,10);
    dbCursor.execute('''
    SELECT substr(lastUpdateTime,1,10),
           max(lastDayEnergy),
           max(currentPower)
      FROM overview
     WHERE siteId=?
       AND lastUpdateTime>=?
       AND lastUpdateTime<=?
     GROUP BY substr(lastUpdateTime,1,10)
    ''',(siteInfo['id'],fromDateStr,toDateStr,))

    tempDict={}

    for row in dbCursor:
        dateStr=row[0]
        tempDict[dateStr]={}
        tempDict[dateStr]['energy']=row[1]
        tempDict[dateStr]['peakPower']=row[2]
   
    return tempDict

# select week, sum(lastDayEnergy)
# from (
# select substr(lastUpdateTime,1,10),
#        date(lastUpdateTime,'-7 days','weekday 0') as week,
#        max(lastDayEnergy) lastDayEnergy
# from overview 
# group by substr(lastUpdateTime,1,10)
# )
# group by week;
def getWeeklyBetween(siteInfo,fromDateStr,toDateStr):
    openCursor()

    dbCursor.execute('''
    SELECT week,
           sum(lastDayEnergy)
      FROM (SELECT substr(lastUpdateTime,1,10),
                   max(date(lastUpdateTime,'-6 days','weekday 0')) as week,
                   max(lastDayEnergy) lastDayEnergy
              FROM overview
             WHERE siteId=?
               AND lastUpdateTime>=?
               AND lastUpdateTime<=?
             GROUP BY substr(lastUpdateTime,1,10))
     GROUP BY week
    ''',(siteInfo['id'],fromDateStr,toDateStr,))

    tempDict={}

    for row in dbCursor:
        tempDict[row[0]]=row[1]
   
    return tempDict



def getMonthlyBetween(siteInfo,fromDateStr,toDateStr):
    openCursor()

# select substr(lastUpdateTime,1,7),max(lastMonthEnergy) from overview group by substr(lastUpdateTime,1,7);
    dbCursor.execute('''
    SELECT substr(lastUpdateTime,1,7),
           max(lastMonthEnergy)
      FROM overview
     WHERE siteId=?
       AND lastUpdateTime>=?
       AND lastUpdateTime<=?
     GROUP BY substr(lastUpdateTime,1,7)
    ''',(siteInfo['id'],fromDateStr,toDateStr,))

    tempDict={}

    for row in dbCursor:
        tempDict[row[0]]=row[1]
   
    return tempDict



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
