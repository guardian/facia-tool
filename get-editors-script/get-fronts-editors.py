'''
This script is to produce a json file that contains the fronts editors grouped by priority.
The 'run' function is the entry point. This script will by default get data for the last 7 days
starting from today for CODE environment users.

The file will be output to whichever directory the script is in.

The output file should be put in the 'fronts-editors-list' s3 bucket in the 'cms-fronts' account.
'''

from datetime import datetime, timedelta
import boto3
import os
import json

session = boto3.Session(profile_name='cmsFronts')
s3 = session.resource('s3')

def run(end_date = datetime.now(), environment = 'PROD', num_of_days = 7):
    print 'Starting script, this may take a while...'
    collections = build_dictionary_of_collection_editors(end_date, environment, num_of_days)
    print 'Got collections editors...'
    fronts_editors = get_front_editors(collections, environment)
    print 'Got fronts editors...'
    front_type_editors = get_editor_by_front_type(fronts_editors)
    print 'Got front type editors, writing results to json file...'
    filename = ('editors_at_' + str(end_date)).replace(' ', '')
    save_dictionary_to_json_file(front_type_editors, filename)
    print 'Finished running script. List of editors in the ' + filename + '.json file.'

def get_editor_by_front_type(fronts_editors):
    editorial = set()
    email = set()
    commercial = set()
    training = set()
    for front_name in fronts_editors:
        front = fronts_editors.get(front_name,{})
        front_type = front['front_type']
        editors = front['editors']
        if(front_type == 'editorial'):
            editorial = editorial.union(editors)
        elif(front_type == 'commercial'):
            commercial = commercial.union(editors)
        elif(front_type == 'email'):
            email = email.union(editors)
        else:
            training = training.union(editors)
    return {'editorial': list(editorial), 'commercial': list(commercial), 'email': list(email), 'training': list(training)}

'''
Downloads config file from s3 which contains information on which collections are on which fronts. Combines this with 
the collections dictionary of who edited a collection to establish who edited a front.
@param collections: A dictionary of the form {unique_collection_id:(set of editors who modifed the collection)}
@return: A dictionary of the form: {front_name:{front_type: type, editors:(set of editors)}}
'''
def get_front_editors(collections, environment):
    path = environment + '/frontsapi/config/config.json'
    s3.Object('facia-tool-store', path).download_file('./frontsconfig.json')
    with open('frontsconfig.json') as data_file:    
        config = json.load(data_file)
    fronts = (config['fronts'])
    fronts_editors = {}
    for front_name in fronts:
        front = fronts.get(front_name, {})
        front_type = front.get('priority', 'editorial')
        collections_on_front = front.get('collections', [])
        editors = set()
        for collection_id in collections_on_front:
            editors = editors.union(collections.get(collection_id, set()))
        fronts_editors[front_name] = {'front_type': front_type, 'editors': editors}
    os.remove('./frontsconfig.json')
    return fronts_editors

'''
The collection that was updated, when it was updated and who updated it is stored in the 
'facia-tool-store' s3 bucket in the 'history' bucket. This bucket stores update records.
These are objects in s3 that document changes made to collections. The information needs to be extracted 
from the structure of the s3 buckets as it is encoded in the bucket names in s3. i.e. a collection modified
on the 1st of August 2018 is in a nested bucket 2018/8/1. The collection being updated also comes from the 
name of the bucket the update record is in. If the collection id has '/' in it the collection id will be encoded
across multiple levels of bucket nesting e.g. the update records for the collection with id 
'au/commentisfree/regular-stories' is stored in the series of nested buckets 'au/commentisfree/regular-stories'.
The fronts editor who modified a collection can be extracted from the name of the update record.

@param end_date: Most recent date you want records for. Spliting by day is the most granular the script will do
@param environment: Whether to get CODE, DEV or PROD editors.
@param num_of_days: How many days of data to get prior to the end date.
@return a dictionary of the form {unique_collection_id:(set of editors who modifed the collection)}
'''
def build_dictionary_of_collection_editors(end_date, environment, num_of_days):
    prefix_filters = get_prefixes(end_date, environment, num_of_days)
    bucket = s3.Bucket('facia-tool-store')
    collections = {}

    for prefix in prefix_filters:
        sub_buckets = bucket.objects.filter(Prefix=prefix)
        for sub_bucket in sub_buckets:
            prefix_length = len(prefix)
            path_without_prefix = sub_bucket.key[prefix_length:]
            collection_id = get_collection_id(path_without_prefix)
            editor = extract_editor(path_without_prefix)
            collections = insert_collection(collections, collection_id, editor)
    
    return collections

'''
Builds the prefix to the buckets we need to get who edited collections in the given time range.
The 'strftime' is to ensure that we get the month and day as a 2 digit
number every time.
@param end_date: Most recent date you want records for. Spliting by day is the most granular the script will do
@param environment: Whether to get CODE, DEV or PROD users. Defaults to CODE
@param num_of_days: How many days of data to get prior to the end date. Defaults to 7.
@return: Returns a list of bucket prefixes for each day in the time range.
'''
def get_prefixes(end_date, environment, num_of_days):
    one_day = timedelta(days=1)
    prefixes = []
    date = end_date
    for i in range(0, num_of_days):
        bucket_path = (environment.upper() + 
            '/frontsapi/history/collection/' 
             + str(date.year) 
            + '/' + date.strftime('%m') 
            + '/' + date.strftime('%d') + '/')
        prefixes.append(bucket_path)
        date = date - one_day  
    return prefixes

'''
Takes a path to an update record and extracts the collection id from it.
@param path: This represents the collection id and the update record
@retun collection id
'''
def get_collection_id(path):
    components = path.split('/')
    id = components[0]
    for i in range(1, len(components)-1):
        id = id + '/' + components[i]
    return id

'''
Really horrible hard coding to extract the full name of the editor from the path and update record object name.
The object name will look like this:
'2018-07-26T14:24:38.471Z.first.last@guardian.co.uk.json'
or like this
'2018-07-27T14:33:56.917+01:00.first.last@guardian.co.uk.json'
The path to the update record is thrown away
I'm sorry
@param path: This represents the collection id and the update record
@return: The user who edited the collection encoded in the path
'''
def extract_editor(path):
    update_record = path.split('/')[-1]
    l = update_record.split('.')
    # Get the length of the date and add 2 to account for the 2 '.' that this will not take into account
    num_chars_to_remove = len(l[0] + l[1]) + 2
    name_without_date = update_record[num_chars_to_remove:]
    # Throw away everything after the name
    name = name_without_date.split('@')[0]
    return name

'''
Updates the collections dictionary to include a new editor and/or collection
@param collections: Collections dictionary to update. Takes the form {unique_collection_id:(set of editors who modifed the collection)}
@param collection_id: Id of collection to update
@param editor: New collection editor
@return Updated collections dictionary
'''
def insert_collection(collections, collection_id, editor):
    if (collection_id in collections):
        editors = collections[collection_id]
        editors.add(editor)
        collections[collection_id] = editors
        return collections
    else:
        collections[collection_id] = {editor}
        return collections

def save_dictionary_to_json_file(dict, filename):
    j = json.dumps(dict, indent=4)
    f = open(filename + '.json','w')
    f.write(j)
    f.close()

run()
