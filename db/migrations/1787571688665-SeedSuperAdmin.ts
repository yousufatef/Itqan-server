import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcryptjs";

export class SeedSuperAdmin1787571688665 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hashedPassword = await bcrypt.hash("Pssw0rd", 10);
        await queryRunner.query(
            `INSERT INTO "users" ("email", "password", "userType", "isActive") VALUES ($1, $2, $3, $4)`,
            ["superadmin@itqan.com", hashedPassword, "super_admin", true]
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "users" WHERE "email" = $1`,
            ["superadmin@itqan.com"]
        );
    }

}
