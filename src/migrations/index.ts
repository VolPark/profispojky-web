import * as migration_20261002_082055_initial from './20261002_082055_initial';

export const migrations = [
  {
    up: migration_20261002_082055_initial.up,
    down: migration_20261002_082055_initial.down,
    name: '20261002_082055_initial'
  },
];
