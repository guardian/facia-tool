# Who's been editing my fronts?

The purpose of the `get-fronts-editors.py` script is to create a json file of all the fronts users who have edited a front this data is grouped by front priority (editorial, training, commercial, email). By default the script collects data for the past 7 days for users of the PROD environment. To change these parameters you need to pass explicit values into the call to the `run()` function

## Running the script
The script will take a few minutes to run when getting data for the last 7 days from PROD. I reccomend not doing too long a time period in one go as getting all the editors requires a lot of calls to s3.

The call:
`python get-fronts-editors.py`
will create a json file in the same directory of all the editors.