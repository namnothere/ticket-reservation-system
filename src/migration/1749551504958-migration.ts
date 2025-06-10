import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1749551504958 implements MigrationInterface {
    name = 'Migration1749551504958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seat" DROP CONSTRAINT "FK_6f9180da82fbdeb46141993f679"`);
        await queryRunner.query(`ALTER TABLE "seat" ADD CONSTRAINT "FK_6f9180da82fbdeb46141993f679" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seat" DROP CONSTRAINT "FK_6f9180da82fbdeb46141993f679"`);
        await queryRunner.query(`ALTER TABLE "seat" ADD CONSTRAINT "FK_6f9180da82fbdeb46141993f679" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
