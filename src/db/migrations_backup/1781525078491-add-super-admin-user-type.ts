import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSuperAdminUserType1781525078491 implements MigrationInterface {
    name = 'AddSuperAdminUserType1781525078491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_68767eabec126a0d32f61865a39"`);
        await queryRunner.query(`ALTER TYPE "public"."users_usertype_enum" ADD VALUE 'super_admin'`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_68767eabec126a0d32f61865a39" UNIQUE ("email", "userType")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_68767eabec126a0d32f61865a39"`);
        await queryRunner.query(`CREATE TYPE "public"."users_usertype_enum_old" AS ENUM('admin', 'normal_user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" TYPE "public"."users_usertype_enum_old" USING "userType"::"text"::"public"."users_usertype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_usertype_enum_old" RENAME TO "users_usertype_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_68767eabec126a0d32f61865a39" UNIQUE ("email", "userType")`);
    }

}
