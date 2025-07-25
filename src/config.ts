import { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile(".env");

type APIConfig = {
    fileserverHits: number;
    db: DBConfig;
};

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig  
};

function envOrThrow(key: string): string {
    if (process.env[key]) {
        return process.env[key]
    }
    throw new Error(`Env variable ${key} not found`);
}


export const cfg: APIConfig = {
    fileserverHits: 0,
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: { migrationsFolder: "./src/db",}
    },
};