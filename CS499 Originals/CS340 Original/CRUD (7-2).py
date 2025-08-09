#!/usr/bin/env python
# coding: utf-8


#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Jul 24 17:23:13 2024

@author: coreysampson_snhu
"""
from pymongo import MongoClient
from bson.objectid import ObjectId
import urllib.parse

class AnimalShelter(object):
    
    # Property variables
    records_updated = 0
    records_matched = 0
    records_deleted = 0
    
    # Initialize MongoDB
    def __init__(self, _username, _password):
        
        #URI is percent escaped per pymongo docs
        username = urllib.parse.quote_plus(_username)
        password = urllib.parse.quote_plus(_password)
        
        self.client = MongoClient('mongodb://%s:%s@nv-desktop-services.apporto.com:30968/?authSource=admin' % (username, password))
        self.database = self.client['AAC']
    
    # Method for creating a record, Create of CRUD
    def create(self, data):
        if data:
            insertValid = self.database.animals.insert_one(data)
            #Status check of inserted data
            return True if insertValid.acknowledged else False
        else:
            raise Exception("No document to save, data parameter is empty.")
            
    # Method for reading a record ID, mostly for test
    def readId(self, postId):
        _data = self.database.find_one({'_id' : ObjectId(postId)})
        return _data
    
    # Method for reading a record based on criteria
    # Returns all records if criteria parameter is empty, default criteria is None
    # Record ID is not returned, R of CRUD
    def read(self, criteria):
        if criteria:
            _data = self.database.animals.find(criteria, {'_id' : 0})
        else:
            _data = self.database.animals.find({},{'_id' : 0})
            
            return _data
        
    # Method to update a record, U of CRUD
    def update(self, query, newData):
        if not query:
            raise Exception("No search criteria is entered.")
        elif not newData:
            raise Exception("No new data is entered.")
        else:
            updateValid = self.database.animals.update_many(query, {"$set": newData})
            self.records_updated = updateValid.modified_count
            self.records_matched = updateValid.matched_count
            
            return True if updateValid.modified_count > 0 else False
       
    # Method to delete a record, D of CRUD
    def delete(self, query):
        if not query:
            raise Exception("No search criteria entered.")
        else:
            deleteValid = self.database.animals.delete_many(query)
            self.records_deleted = deleteValid.deleted_count
            
            return True if deleteValid.deleted_count > 0 else False