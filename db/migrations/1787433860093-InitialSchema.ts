import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1787433860093 implements MigrationInterface {
  name = 'InitialSchema1787433860093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."users_usertype_enum" AS ENUM('super_admin', 'admin', 'normal_user')`);
    await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(250) NOT NULL, "username" character varying(150), "password" character varying NOT NULL, "userType" "public"."users_usertype_enum" NOT NULL DEFAULT 'normal_user', "isAccountVerified" boolean NOT NULL DEFAULT false, "profileImage" character varying, "roleId" integer, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "parents" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "access_token" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "UQ_c94c3cea9b43a18c81269ded41d" UNIQUE ("user_id"), CONSTRAINT "UQ_e584d29beebd614be5c9ca4c66f" UNIQUE ("access_token"), CONSTRAINT "PK_9a4dc67c7b8e6a9cb918938d353" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "parent_students" ("id" SERIAL NOT NULL, "parent_id" integer NOT NULL, "student_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_2707b9be03fad93515167debe7a" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TYPE "public"."daily_records_attendance_status_enum" AS ENUM('present', 'absent')`);
    await queryRunner.query(`CREATE TABLE "daily_records" ("id" SERIAL NOT NULL, "student_id" integer NOT NULL, "circle_id" integer NOT NULL, "teacher_id" integer NOT NULL, "record_date" date NOT NULL, "attendance_status" "public"."daily_records_attendance_status_enum" NOT NULL, "evaluation" text, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_12e9a005e55a184469b5c922b3f" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97eef28d9dfb9f3c9ac2d4c2af" ON "daily_records" ("student_id", "circle_id", "record_date") `);
    await queryRunner.query(`CREATE TABLE "teachers" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "UQ_4668d4752e6766682d1be0b346f" UNIQUE ("user_id"), CONSTRAINT "PK_a8d4f83be3abe4c687b0a0093c8" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "circles" ("id" SERIAL NOT NULL, "name" character varying(250) NOT NULL, "teacher_id" integer NOT NULL, "days" character varying, "start_time" TIME, "end_time" TIME, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_8348b53fdd4f7b6c0b3a6a2f61f" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "circle_students" ("id" SERIAL NOT NULL, "circle_id" integer NOT NULL, "student_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_94631c606119d2df3de7e32bbd3" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "students" ("id" SERIAL NOT NULL, "name" character varying(250) NOT NULL, "phone_number" character varying(20), "birth_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TYPE "public"."financial_categories_type_enum" AS ENUM('income', 'expense')`);
    await queryRunner.query(`CREATE TABLE "financial_categories" ("id" SERIAL NOT NULL, "name" character varying(250) NOT NULL, "type" "public"."financial_categories_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_cd806eb06bb34758203c506ff15" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "financial_transactions" ("id" SERIAL NOT NULL, "category_id" integer NOT NULL, "amount" numeric(10,2) NOT NULL, "transaction_date" date NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_3f0ffe3ca2def8783ad8bb5036b" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "parents" ADD CONSTRAINT "FK_c94c3cea9b43a18c81269ded41d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "parent_students" ADD CONSTRAINT "FK_0b5ad7b1365e1d5e0181e86cbc5" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "parent_students" ADD CONSTRAINT "FK_5b645c512c1e80fa277f034ab6c" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "daily_records" ADD CONSTRAINT "FK_6c8d4b26d41cf330a6f1725d187" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "daily_records" ADD CONSTRAINT "FK_47e517088ef5fb3aaca810d98f7" FOREIGN KEY ("circle_id") REFERENCES "circles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "daily_records" ADD CONSTRAINT "FK_5c71ea5c81e749c74396f9743dd" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "teachers" ADD CONSTRAINT "FK_4668d4752e6766682d1be0b346f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "circles" ADD CONSTRAINT "FK_2c69a97deebb13ab4c1c32bd383" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "circle_students" ADD CONSTRAINT "FK_cd681487fdae2a18044ebdc9e84" FOREIGN KEY ("circle_id") REFERENCES "circles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "circle_students" ADD CONSTRAINT "FK_eed5597fd532fc2e47e111a4748" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "financial_transactions" ADD CONSTRAINT "FK_9bc2d00a671cd5fc675da1588e0" FOREIGN KEY ("category_id") REFERENCES "financial_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "financial_transactions" DROP CONSTRAINT "FK_9bc2d00a671cd5fc675da1588e0"`);
    await queryRunner.query(`ALTER TABLE "circle_students" DROP CONSTRAINT "FK_eed5597fd532fc2e47e111a4748"`);
    await queryRunner.query(`ALTER TABLE "circle_students" DROP CONSTRAINT "FK_cd681487fdae2a18044ebdc9e84"`);
    await queryRunner.query(`ALTER TABLE "circles" DROP CONSTRAINT "FK_2c69a97deebb13ab4c1c32bd383"`);
    await queryRunner.query(`ALTER TABLE "teachers" DROP CONSTRAINT "FK_4668d4752e6766682d1be0b346f"`);
    await queryRunner.query(`ALTER TABLE "daily_records" DROP CONSTRAINT "FK_5c71ea5c81e749c74396f9743dd"`);
    await queryRunner.query(`ALTER TABLE "daily_records" DROP CONSTRAINT "FK_47e517088ef5fb3aaca810d98f7"`);
    await queryRunner.query(`ALTER TABLE "daily_records" DROP CONSTRAINT "FK_6c8d4b26d41cf330a6f1725d187"`);
    await queryRunner.query(`ALTER TABLE "parent_students" DROP CONSTRAINT "FK_5b645c512c1e80fa277f034ab6c"`);
    await queryRunner.query(`ALTER TABLE "parent_students" DROP CONSTRAINT "FK_0b5ad7b1365e1d5e0181e86cbc5"`);
    await queryRunner.query(`ALTER TABLE "parents" DROP CONSTRAINT "FK_c94c3cea9b43a18c81269ded41d"`);
    await queryRunner.query(`DROP TABLE "financial_transactions"`);
    await queryRunner.query(`DROP TABLE "financial_categories"`);
    await queryRunner.query(`DROP TYPE "public"."financial_categories_type_enum"`);
    await queryRunner.query(`DROP TABLE "students"`);
    await queryRunner.query(`DROP TABLE "circle_students"`);
    await queryRunner.query(`DROP TABLE "circles"`);
    await queryRunner.query(`DROP TABLE "teachers"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_97eef28d9dfb9f3c9ac2d4c2af"`);
    await queryRunner.query(`DROP TABLE "daily_records"`);
    await queryRunner.query(`DROP TYPE "public"."daily_records_attendance_status_enum"`);
    await queryRunner.query(`DROP TABLE "parent_students"`);
    await queryRunner.query(`DROP TABLE "parents"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
  }
}