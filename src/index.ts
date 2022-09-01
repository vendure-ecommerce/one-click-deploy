import { bootstrap, runMigrations } from '@vendure/core';
import { config } from './vendure-config';
import { populateOnFirstRun } from './populate';

populateOnFirstRun(config)
    .then(() => runMigrations(config))
    .then(() => bootstrap(config))
    .catch(err => {
        console.log(err);
    });
