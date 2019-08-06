import boto3
import json
import datetime
import io
import time
import sys

session = boto3.Session(profile_name='cmsFronts')
s3 = session.resource('s3')
bucket = 'facia-tool-store'
fileName = 'config.json'


def get_collection_json(collection_id, collectionPath):
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
    Fronts which have a mixuture of fully automated and curated collections will have the names of collections
    in these groups recorded in a separate file.
    Takes the stage (CODE/PROD) we are querying as the first argument
    '''

    print 'Starting script'
    if len(sys.argv) > 1:
        stage = sys.argv[1]
        configPath = stage + '/frontsapi/config/config.json'
        collectionPath = stage + '/frontsapi/collection/'
        no_backfill_fronts = list()
        automated_fronts = list()
        manual_backfill_fronts = list()

        s3.Object(bucket, configPath).download_file('./frontsconfig.json')
        with open('frontsconfig.json') as data_file:
            config = json.load(data_file)

        fronts = (config['fronts'])
        collections = (config['collections'])

        for front_name in fronts:

            front_config = fronts.get(front_name)
            front_collections = front_config.get('collections')

            if not 'priority' in front_config:

                #Keep track of what kind of front we are looking at
                automated = True
                fully_manual = True
                manual_backfill = False

                #Keep track of which collections are either curated or fully automated
                curated_collections = list()
                automated_collections = list()

                last_updates = list()

                for collection_id in front_collections:
                    collection = collections.get(collection_id)
                    edited_collection = get_collection_json(collection_id, collectionPath)
                    curated_collection = False

                    name = collection.get('displayName')

                    if edited_collection:
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
                            if live and len(live) > 0:
                                if any("snap" not in item.get('id') for item in live):
                                    automated = False
                                    curated_collection = True

                            if draft and len(draft) > 0:
                                if any("snap" not in item.get('id') for item in draft):
                                    automated = False
                                    curated_collection = True
                        if curated_collection:
                            manual_backfill = True
                            curated_collections.append(name)
                        else:
                            automated_collections.append(name)
                    else:
                        automated = False
                        curated_collections.append(name)

                if len(last_updates) > 0:
                    last_front_update = max(last_updates)
                    date = datetime.datetime.fromtimestamp(last_front_update/1000.0).strftime('%Y-%m-%d %H:%M:%S')
                else:
                    date = ''

                if automated:
                    automated_fronts.append(front_name + ', ' + date)
                if fully_manual:
                    no_backfill_fronts.append(front_name + ', ' + date)
                if manual_backfill:
                    front_details = { front_name: { 'curated': curated_collections, 'automated': automated_collections} }
                    manual_backfill_fronts.append(front_details)

        automated_json = json.dumps(automated_fronts, indent=4)
        fautomated = open('automated_fronts.json', 'w')
        fautomated.write(automated_json)

        no_backfilled_json = json.dumps(no_backfill_fronts, indent=4)
        fnobackfilled = open('not_backfilled_fronts.json', 'w')
        fnobackfilled.write(no_backfilled_json)

        manual_backfill_fronts_json = json.dumps(manual_backfill_fronts, indent=4)
        fmanualbackfilled = open('manual_backfilled_fronts.json', 'w')
        fmanualbackfilled.write(manual_backfill_fronts_json)
    else:
        print >> sys.stderr, "Usage: pass in the stage"

run()
