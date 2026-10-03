import * as migration_20261002_082055_initial from './20261002_082055_initial';
import * as migration_20261002_090544_storage_object_key from './20261002_090544_storage_object_key';
import * as migration_20261002_092459_trash_and_versions from './20261002_092459_trash_and_versions';
import * as migration_20261002_100343_users_name_required from './20261002_100343_users_name_required';
import * as migration_20261002_154733_old_site_import from './20261002_154733_old_site_import';
import * as migration_20261003_053358_tech_sheets from './20261003_053358_tech_sheets';

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
    name: '20261002_092459_trash_and_versions',
  },
  {
    up: migration_20261002_100343_users_name_required.up,
    down: migration_20261002_100343_users_name_required.down,
    name: '20261002_100343_users_name_required',
  },
  {
    up: migration_20261002_154733_old_site_import.up,
    down: migration_20261002_154733_old_site_import.down,
    name: '20261002_154733_old_site_import',
  },
  {
    up: migration_20261003_053358_tech_sheets.up,
    down: migration_20261003_053358_tech_sheets.down,
    name: '20261003_053358_tech_sheets'
  },
];
