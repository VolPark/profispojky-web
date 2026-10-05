import * as migration_20261002_082055_initial from './20261002_082055_initial';
import * as migration_20261002_090544_storage_object_key from './20261002_090544_storage_object_key';
import * as migration_20261002_092459_trash_and_versions from './20261002_092459_trash_and_versions';
import * as migration_20261002_100343_users_name_required from './20261002_100343_users_name_required';
import * as migration_20261002_154733_old_site_import from './20261002_154733_old_site_import';
import * as migration_20261003_053358_tech_sheets from './20261003_053358_tech_sheets';
import * as migration_20261003_061718_product_tech_sheet_illustration from './20261003_061718_product_tech_sheet_illustration';
import * as migration_20261004_105828_tech_sheet_note from './20261004_105828_tech_sheet_note';
import * as migration_20261005_114303_homepage_story from './20261005_114303_homepage_story';

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
    name: '20261003_053358_tech_sheets',
  },
  {
    up: migration_20261003_061718_product_tech_sheet_illustration.up,
    down: migration_20261003_061718_product_tech_sheet_illustration.down,
    name: '20261003_061718_product_tech_sheet_illustration',
  },
  {
    up: migration_20261004_105828_tech_sheet_note.up,
    down: migration_20261004_105828_tech_sheet_note.down,
    name: '20261004_105828_tech_sheet_note',
  },
  {
    up: migration_20261005_114303_homepage_story.up,
    down: migration_20261005_114303_homepage_story.down,
    name: '20261005_114303_homepage_story'
  },
];
