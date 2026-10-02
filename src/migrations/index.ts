import * as migration_20261002_082055_initial from './20261002_082055_initial';
import * as migration_20261002_090544_storage_object_key from './20261002_090544_storage_object_key';
import * as migration_20261002_092459_trash_and_versions from './20261002_092459_trash_and_versions';

export const migrations = [
  {
    up: migration_20261002_082055_initial.up,
    down: migration_20261002_082055_initial.down,
    name: '20261002_082055_initial',
  },
  {
    up: migration_20261002_090544_storage_object_key.up,
    down: migration_20261002_090544_storage_object_key.down,
    name: '20261002_090544_storage_object_key',
  },
  {
    up: migration_20261002_092459_trash_and_versions.up,
    down: migration_20261002_092459_trash_and_versions.down,
    name: '20261002_092459_trash_and_versions'
  },
];
