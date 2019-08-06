import boto3
import json

session = boto3.Session(profile_name='cmsFronts')
s3 = session.resource('s3')
bucket = s3.Bucket('facia-tool-store')
configPath = 'PROD/frontsapi/config/config.json'
fileName = 'config.json'

def run():
    '''
    Finds all collections which are platform specific and share a
    collection with another front.
    '''

    print 'Starting script'
    shared_platform_fronts = list()
    s3.Object('facia-tool-store', configPath).download_file('./frontsconfig.json')
    with open('frontsconfig.json') as data_file:
        config = json.load(data_file)
    fronts = (config['fronts'])
    all_collections = (config['collections'])
    for front_name in fronts:
        front_config = fronts.get(front_name)
        front_collections = front_config.get('collections')
        for front_collection in front_collections:
            for front_name2 in fronts:
                if front_name2 != front_name:
                    config2 = fronts.get(front_name2)
                    collections2 = config2.get('collections')
                    if front_collection in collections2:
                        collection_config = all_collections.get(front_collection)
                        if collection_config.get('platform'):
                            shared_platform_fronts.append(front_collection)

    print 'Shared collections:'
    print shared_platform_fronts

run()


