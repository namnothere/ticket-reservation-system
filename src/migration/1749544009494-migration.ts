import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1749544009494 implements MigrationInterface {
    name = 'Migration1749544009494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "totalSeats" integer NOT NULL, "availableSeats" integer NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."seat_status_enum" AS ENUM('available', 'reserved')`);
        await queryRunner.query(`CREATE TABLE "seat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "seatNumber" integer NOT NULL, "status" "public"."seat_status_enum" NOT NULL DEFAULT 'available', "eventId" uuid NOT NULL, "reservationId" uuid, CONSTRAINT "PK_4e72ae40c3fbd7711ccb380ac17" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reservation_status_enum" AS ENUM('pending', 'confirmed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "reservation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventId" uuid NOT NULL, "userId" character varying NOT NULL, "status" "public"."reservation_status_enum" NOT NULL DEFAULT 'pending', CONSTRAINT "PK_48b1f9922368359ab88e8bfa525" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "seat" ADD CONSTRAINT "FK_6f9180da82fbdeb46141993f679" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "seat" ADD CONSTRAINT "FK_b4afb06be2dbabaa66672654d1e" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_eda8fcaaa71703a532e1c9eca0a" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_eda8fcaaa71703a532e1c9eca0a"`);
        await queryRunner.query(`ALTER TABLE "seat" DROP CONSTRAINT "FK_b4afb06be2dbabaa66672654d1e"`);
        await queryRunner.query(`ALTER TABLE "seat" DROP CONSTRAINT "FK_6f9180da82fbdeb46141993f679"`);
        await queryRunner.query(`DROP TABLE "reservation"`);
        await queryRunner.query(`DROP TYPE "public"."reservation_status_enum"`);
        await queryRunner.query(`DROP TABLE "seat"`);
        await queryRunner.query(`DROP TYPE "public"."seat_status_enum"`);
        await queryRunner.query(`DROP TABLE "event"`);
    }

}
