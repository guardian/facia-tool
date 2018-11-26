import boto3
import json
import datetime
import io
import time

session = boto3.Session(profile_name='cmsFronts')
s3 = session.resource('s3')
bucket = 'facia-tool-store'
stage = 'PROD'
configPath = stage + '/frontsapi/config/config.json'
collectionPath = stage + '/frontsapi/collection/'
fileName = 'config.json'


def get_collection_json(collection_id):
    obj = s3.Object(bucket, collectionPath + collection_id + '/collection.json')
    try:
        data = io.BytesIO()
        obj.download_fileobj(data)
        edited_collection = json.loads(data.getvalue().decode('utf-8'))
        return edited_collection
    except:
        None

def run():
    '''
    Finds editorialfronts which are either fully automated or do not contain any automated collections.
    Writes the names of these fronts and the time they were last edited into a json file.
    '''

    print 'Starting script'
    no_backfill_fronts = list()
    automated_fronts = list()

    s3.Object(bucket, configPath).download_file('./frontsconfig.json')
    with open('frontsconfig.json') as data_file:
        config = json.load(data_file)

    fronts = (config['fronts'])
    collections = (config['collections'])

    for front_name in fronts:

        front_config = fronts.get(front_name)
        front_collections = front_config.get('collections')

        if not 'priority' in front_config:
            automated = True
            fully_manual = True
            last_updates = list()

            for collection_id in front_collections:
                collection = collections.get(collection_id)
                edited_collection = get_collection_json(collection_id)

                if edited_collection:
                    name = edited_collection.get('displayName')
                    update = edited_collection.get('lastUpdated')
                    if isinstance(update, int):
                        last_updates.append(update)
                    else:
                        #Some old collections have last update time saved as string
                        dt_obj = datetime.datetime.strptime(update, '%Y-%m-%dT%H:%M:%S.%fZ')
                        last_updates.append(time.mktime(dt_obj.timetuple())*1000)

                if 'backfill' in collection:
                    fully_manual = False
                    #For any collection with a backfill we also need to check if it contains
                    #manually curated articles. If it does, it is not a fully automated collecion.
                    if edited_collection:
                        live = edited_collection.get('live')
                        draft = edited_collection.get('draft')
                        if name == 'new':
                            if (live and len(live) > 0) or (draft and len(draft) > 0):
                                automated = False
                else:
                    automated = False

            if len(last_updates) > 0:
                last_front_update = max(last_updates)
                date = datetime.datetime.fromtimestamp(last_front_update/1000.0).strftime('%Y-%m-%d %H:%M:%S')
            else:
                date = ''

            if automated:
                automated_fronts.append(front_name + ', ' + date)
            if fully_manual:
                no_backfill_fronts.append(front_name + ', ' + date)

    automated_json = json.dumps(automated_fronts, indent=4)
    fautomated = open('automated_fronts.json', 'w')
    fautomated.write(automated_json)

    no_backfilled_json = json.dumps(no_backfill_fronts, indent=4)
    fnobackfilled = open('not_backfilled_fronts.json', 'w')
    fnobackfilled.write(no_backfilled_json)

run()
