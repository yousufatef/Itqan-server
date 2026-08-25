import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Always load .env first so DATABASE_URL (remote DB) takes priority
config({ path: '.env' });

// Then load env-specific file for other variables (SMTP, JWT, etc.)
if (process.env.NODE_ENV !== 'production') {
  config({ path: `.env.${process.env.NODE_ENV || 'development'}`, override: false });
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',

  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    }),

  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,

  synchronize: false,

  entities: [join(__dirname, '../src/**/*.entity.js')],

  migrations: [join(__dirname, 'migrations/*.js')],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
