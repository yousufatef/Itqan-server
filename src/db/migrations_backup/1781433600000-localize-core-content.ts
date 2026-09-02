import { MigrationInterface, QueryRunner } from "typeorm";

export class LocalizeCoreContent1781433600000 implements MigrationInterface {
    name = 'LocalizeCoreContent1781433600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" RENAME COLUMN "title" TO "nameEn"`);
        await queryRunner.query(`ALTER TABLE "blogs" RENAME COLUMN "description" TO "descriptionEn"`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "nameAr" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "descriptionAr" text`);
        await queryRunner.query(`UPDATE "blogs" SET "nameAr" = "nameEn" WHERE "nameAr" IS NULL`);
        await queryRunner.query(`UPDATE "blogs" SET "descriptionAr" = "descriptionEn" WHERE "descriptionAr" IS NULL`);
        await queryRunner.query(`ALTER TABLE "blogs" ALTER COLUMN "nameAr" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "blogs" ALTER COLUMN "descriptionAr" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "categories" RENAME COLUMN "name" TO "nameEn"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "nameAr" character varying(100)`);
        await queryRunner.query(`UPDATE "categories" SET "nameAr" = "nameEn" WHERE "nameAr" IS NULL`);
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "nameAr" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_categories_nameAr" UNIQUE ("nameAr")`);

        await queryRunner.query(`ALTER TABLE "roles" RENAME COLUMN "name" TO "nameEn"`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "nameAr" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`UPDATE "roles" SET "nameAr" = "nameEn" WHERE "nameAr" = ''`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "nameAr" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "UQ_roles_nameAr" UNIQUE ("nameAr")`);

        await queryRunner.query(`ALTER TABLE "permissions" RENAME COLUMN "name" TO "nameEn"`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "nameAr" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`UPDATE "permissions" SET "nameAr" = "nameEn" WHERE "nameAr" = ''`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "nameAr" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "nameAr"`);
        await queryRunner.query(`ALTER TABLE "permissions" RENAME COLUMN "nameEn" TO "name"`);

        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "UQ_roles_nameAr"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "nameAr"`);
        await queryRunner.query(`ALTER TABLE "roles" RENAME COLUMN "nameEn" TO "name"`);

        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_categories_nameAr"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "nameAr"`);
        await queryRunner.query(`ALTER TABLE "categories" RENAME COLUMN "nameEn" TO "name"`);

        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "descriptionAr"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "nameAr"`);
        await queryRunner.query(`ALTER TABLE "blogs" RENAME COLUMN "descriptionEn" TO "description"`);
        await queryRunner.query(`ALTER TABLE "blogs" RENAME COLUMN "nameEn" TO "title"`);
    }
}
