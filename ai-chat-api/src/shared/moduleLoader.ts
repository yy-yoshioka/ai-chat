import { Express } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '@shared/logger';

export interface ModuleDefinition {
  name: string;
  initialize?: (app: Express) => Promise<void>;
  routes?: (app: Express) => void;
  cleanup?: () => Promise<void>;
}

const modules: ModuleDefinition[] = [];

/**
 * Dynamically loads all modules from the modules directory
 */
export async function loadModules(app: Express): Promise<void> {
  const modulesDir = path.join(__dirname, '../modules');

  try {
    const moduleDirectories = await fs.readdir(modulesDir);

    for (const moduleDir of moduleDirectories) {
      const modulePath = path.join(modulesDir, moduleDir);
      const stat = await fs.stat(modulePath);

      if (stat.isDirectory()) {
        try {
          // Try to load module index file
          const moduleIndexPath = path.join(modulePath, 'index.ts');
          const moduleExists = await fs
            .access(moduleIndexPath)
            .then(() => true)
            .catch(() => false);

          if (moduleExists) {
            const module = await import(moduleIndexPath);

            if (module.default && typeof module.default === 'object') {
              const moduleDefinition: ModuleDefinition = {
                name: moduleDir,
                ...module.default,
              };

              modules.push(moduleDefinition);

              // Initialize module if it has an initialization function
              if (moduleDefinition.initialize) {
                await moduleDefinition.initialize(app);
                logger.info(`Initialized module: ${moduleDefinition.name}`);
              }

              // Register routes if the module has routes
              if (moduleDefinition.routes) {
                moduleDefinition.routes(app);
                logger.info(
                  `Registered routes for module: ${moduleDefinition.name}`
                );
              }
            }
          }
        } catch (error) {
          logger.error(`Failed to load module ${moduleDir}:`, error);
        }
      }
    }

    logger.info(`Successfully loaded ${modules.length} modules`);
  } catch (error) {
    logger.error('Failed to load modules:', error);
    throw error;
  }
}

/**
 * Cleanup all loaded modules
 */
export async function cleanupModules(): Promise<void> {
  for (const module of modules) {
    if (module.cleanup) {
      try {
        await module.cleanup();
        logger.info(`Cleaned up module: ${module.name}`);
      } catch (error) {
        logger.error(`Failed to cleanup module ${module.name}:`, error);
      }
    }
  }
}

/**
 * Get list of loaded modules
 */
export function getLoadedModules(): ModuleDefinition[] {
  return [...modules];
}
