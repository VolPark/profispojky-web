import * as migration_20261002_082055_initial from './20261002_082055_initial';
import * as migration_20261002_090544_storage_object_key from './20261002_090544_storage_object_key';

export const migrations = [
  {
    up: migration_20261002_082055_initial.up,
    down: migration_20261002_082055_initial.down,
    name: '20261002_082055_initial',
  },
  {
    up: migration_20261002_090544_storage_object_key.up,
    down: migration_20261002_090544_storage_object_key.down,
    name: '20261002_090544_storage_object_key'
  },
];
