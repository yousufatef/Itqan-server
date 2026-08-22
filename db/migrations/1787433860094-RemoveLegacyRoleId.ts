import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLegacyRoleId1787433860094 implements MigrationInterface {
    name = 'RemoveLegacyRoleId1787433860094';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roleId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "roleId" integer`);
    }
}