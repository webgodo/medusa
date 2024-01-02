import { LoaderOptions, Logger, ModulesSdkTypes } from "@medusajs/types"
import { DALUtils, ModulesSdkUtils } from "@medusajs/utils"
import { EntitySchema } from "@mikro-orm/core"

type MigrationScriptArguments = Pick<
  LoaderOptions<ModulesSdkTypes.ModuleServiceInitializeOptions>,
  "options" | "logger"
> & {
  models: EntitySchema[]
  moduleName: string
  pathToMigrations: string
}

/**
 * This script is only valid for mikro orm managers. If a user provide a custom manager
 * he is in charge of running the migrations.
 * @param options
 * @param logger
 * @param moduleDeclaration
 */
export async function migrationsUp({
  options,
  logger,
  models,
  moduleName,
  pathToMigrations,
}: MigrationScriptArguments) {
  logger ??= console as unknown as Logger

  const dbData = ModulesSdkUtils.loadDatabaseConfig(moduleName, options)!

  const orm = await DALUtils.mikroOrmCreateConnection(
    dbData,
    models,
    pathToMigrations
  )

  try {
    const migrator = orm.getMigrator()

    const pendingMigrations = await migrator.getPendingMigrations()
    logger.info(
      `Running pending migrations: ${JSON.stringify(
        pendingMigrations,
        null,
        2
      )}`
    )

    await migrator.up({
      migrations: pendingMigrations.map((m) => m.name),
    })

    logger.info(`${moduleName} module migration executed`)
  } catch (error) {
    logger.error(
      `${moduleName} module migration failed to run - Error: ${error}`
    )
  }

  await orm.close()
}

export async function migrationsDown({
  options,
  logger,
  models,
  moduleName,
  pathToMigrations,
}: MigrationScriptArguments) {
  logger ??= console as unknown as Logger

  const dbData = ModulesSdkUtils.loadDatabaseConfig(moduleName, options)!

  const orm = await DALUtils.mikroOrmCreateConnection(
    dbData,
    models,
    pathToMigrations
  )

  try {
    const migrator = orm.getMigrator()
    await migrator.down()

    logger?.info(`${moduleName} module migration executed`)
  } catch (error) {
    logger?.error(
      `${moduleName} module migration failed to run - Error: ${error}`
    )
  }

  await orm.close()
}
