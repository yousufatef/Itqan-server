import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOtpsTable1787569671592 implements MigrationInterface {
    name = 'AddOtpsTable1787569671592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "otps" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "otpHash" character varying(255) NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "isUsed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2afebf0234962331e12c59c592" ON "otps" ("expiresAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_82b0deb105275568cdcef2823e" ON "otps" ("userId") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "tokenVersion" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "otps" ADD CONSTRAINT "FK_82b0deb105275568cdcef2823eb" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otps" DROP CONSTRAINT "FK_82b0deb105275568cdcef2823eb"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tokenVersion"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_82b0deb105275568cdcef2823e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2afebf0234962331e12c59c592"`);
        await queryRunner.query(`DROP TABLE "otps"`);
    }

}
