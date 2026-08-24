import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUserTypeToRole1787571423681 implements MigrationInterface {
    name = 'RenameUserTypeToRole1787571423681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_usertype_enum" RENAME TO "users_usertype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_usertype_enum" AS ENUM('super_admin', 'admin', 'teacher', 'parent')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" TYPE "public"."users_usertype_enum" USING "userType"::"text"::"public"."users_usertype_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'admin'`);
        await queryRunner.query(`DROP TYPE "public"."users_usertype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_usertype_enum_old" AS ENUM('super_admin', 'admin', 'normal_user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" TYPE "public"."users_usertype_enum_old" USING "userType"::"text"::"public"."users_usertype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'normal_user'`);
        await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_usertype_enum_old" RENAME TO "users_usertype_enum"`);
    }

}
