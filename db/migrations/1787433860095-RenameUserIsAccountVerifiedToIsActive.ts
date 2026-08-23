import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserIsAccountVerifiedToIsActive1787433860095 implements MigrationInterface {
    name = 'RenameUserIsAccountVerifiedToIsActive1787433860095';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "isAccountVerified" TO "isActive"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "isActive" TO "isAccountVerified"`);
    }
}
