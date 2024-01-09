import {bootstrap, JobQueueService, runMigrations} from '@vendure/core';
import { config } from './vendure-config';
import { populateOnFirstRun } from './populate';

populateOnFirstRun(config)
    .then(() => runMigrations(config))
    .then(() => bootstrap(config))
    .then(app => {
        // For "lite" deployments with limited resources, we can run the job queue
        if (process.env.RUN_WORKER_FROM_SERVER?.toLowerCase() === 'true') {
            return app.get(JobQueueService).start();
        }
    })
    .catch(err => {
        console.log(err);
    });
