import { populate } from '@vendure/core/cli';
import { bootstrap, VendureConfig } from '@vendure/core';
import { createConnection } from 'typeorm';
import path from 'path';

/**
 * @description
 * This function is responsible for populating the DB with test data on the first run. It
 * first checks to see if the configured DB has any tables, and if not, runs the `populate()`
 * function using data from the @vendure/create package.
 */
export async function populateOnFirstRun(config: VendureConfig) {
    const dbTablesAlreadyExist = await tablesExist(config);
    if (!dbTablesAlreadyExist) {
        console.log(`No Vendure tables found in DB. Populating database...`);
        return populate(
            () => bootstrap({
                ...config,
                importExportOptions: {
                    importAssetsDir: path.join(
                        require.resolve('@vendure/create/assets/products.csv'),
                        '../images'
                    ),
                },
                dbConnectionOptions: {...config.dbConnectionOptions, synchronize: true}
            }),
            require('@vendure/create/assets/initial-data.json'),
            require.resolve('@vendure/create/assets/products.csv')
        ).then(app => app.close())
    } else {
        return;
    }
}

async function tablesExist(config: VendureConfig) {
    const connection = await createConnection(config.dbConnectionOptions);
    const result = await connection.query(`
        select n.nspname as table_schema,
               c.relname as table_name,
               c.reltuples as rows
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where c.relkind = 'r'
              and n.nspname = '${process.env.DB_SCHEMA}'
        order by c.reltuples desc;`
    );
    await connection.close();
    return 0 < result.length;
}
