import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1780395353551 implements MigrationInterface {
    name = 'Initial1780395353551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const productsTable = await queryRunner.hasTable("products");
        if (productsTable) {
            const productsSizeColumn = await queryRunner.hasColumn("products", "size");
            if (!productsSizeColumn) {
                await queryRunner.query(`ALTER TABLE "products" ADD "size" integer`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const productsTable = await queryRunner.hasTable("products");
        if (productsTable) {
            const productsSizeColumn = await queryRunner.hasColumn("products", "size");
            if (productsSizeColumn) {
                await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "size"`);
            }
        }
    }

}
