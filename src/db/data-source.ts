import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Always load .env first so DATABASE_URL (remote DB) takes priority
config({ path: '.env' });

// Then load env-specific file for other variables (SMTP, JWT, etc.)
if (process.env.NODE_ENV !== 'production') {
  config({ path: `.env.${process.env.NODE_ENV || 'development'}`, override: false });
}

const useDatabaseUrl = Boolean(process.env.DATABASE_URL) && process.env.USE_LOCAL_DB !== 'true';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',

  ...(useDatabaseUrl
    ? { url: process.env.DATABASE_URL }
    : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    }),

  ssl: useDatabaseUrl
    ? { rejectUnauthorized: false }
    : false,

  synchronize: false,

  entities: [join(__dirname, '../**/*.entity.js')],

  migrations: [join(__dirname, 'migrations/*.js')],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
