import boto3
import json

session = boto3.Session(profile_name='cmsFronts')
s3 = session.resource('s3')
bucket = s3.Bucket('facia-tool-store')
configPath = 'PROD/frontsapi/config/config.json'
fileName = 'config.json'

def run():
    '''
    Finds all fronts which are not training fronts and
    contain trashers. Saves these fronts in a json file.
    '''

    print 'Starting script'
    trasher_fronts = list()
    s3.Object('facia-tool-store', configPath).download_file('./frontsconfig.json')
    with open('frontsconfig.json') as data_file:
        config = json.load(data_file)
    fronts = (config['fronts'])
    collections = (config['collections'])
    for front_name in fronts:
        front_config = fronts.get(front_name)
        front_collections = front_config.get('collections')
        if front_config.get('priority') != 'training':
            for collection_id in front_collections:
                collection = collections.get(collection_id)
                collection_type = collection.get('type')
                collection_name = collection.get('displayName')
                if collection_type == 'fixed/thrasher':
                    trasher_fronts.append(front_name + ', ' + collection_name)
    j = json.dumps(trasher_fronts, indent=4)
    f = open('fronts_list.json','w')
    f.write(j)

run()



