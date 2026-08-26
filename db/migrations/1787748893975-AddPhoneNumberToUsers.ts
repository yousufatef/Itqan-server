import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneNumberToUsers1787748893975 implements MigrationInterface {
    name = 'AddPhoneNumberToUsers1787748893975';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneNumber" character varying(30)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "phoneNumber"`);
    }
}
