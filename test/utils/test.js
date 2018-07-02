import * as utils from './index'
import fs from 'fs'
import npath from 'path'

export const cleanMocks = (path, object) => {
  if (utils.fs.exists(npath.join('test', 'mocks', 'test.md'))) {
    utils.fs.rm(npath.join('test', 'mocks', 'test.md'))
  }
  if (utils.fs.exists(npath.join('test', 'mocks', 'test-2.md'))) {
    utils.fs.rm(npath.join('test', 'mocks', 'test-2.md'))
  }
  if (
    utils.fs.exists(npath.join('test', 'mocks', 'test-directory', 'test-1.md'))
  ) {
    utils.fs.rm(npath.join('test', 'mocks', 'test-directory', 'test-1.md'))
  }
  if (
    utils.fs.exists(npath.join('test', 'mocks', 'test-directory', 'test-2.md'))
  ) {
    utils.fs.rm(npath.join('test', 'mocks', 'test-directory', 'test-2.md'))
  }
  if (
    utils.fs.exists(
      npath.join(
        'test',
        'mocks',
        'test-directory',
        'test-subdirectory',
        'test.md'
      )
    )
  ) {
    utils.fs.rm(
      npath.join(
        'test',
        'mocks',
        'test-directory',
        'test-subdirectory',
        'test.md'
      )
    )
  }

  if (!utils.fs.exists(npath.join('test', 'mocks', 'test-directory'))) {
    utils.fs.mkdir(npath.join('test', 'mocks', 'test-directory'))
  }

  if (
    !utils.fs.exists(
      npath.join('test', 'mocks', 'test-directory', 'test-subdirectory')
    )
  ) {
    utils.fs.mkdir(
      npath.join('test', 'mocks', 'test-directory', 'test-subdirectory')
    )
  }

  fs.copyFileSync(
    npath.join('test', 'mocks-backup', 'test.md'),
    npath.join('test', 'mocks', 'test.md')
  )
  fs.copyFileSync(
    npath.join('test', 'mocks-backup', 'test-directory', 'test-1.md'),
    npath.join('test', 'mocks', 'test-directory', 'test-1.md')
  )
  fs.copyFileSync(
    npath.join('test', 'mocks-backup', 'test-directory', 'test-2.md'),
    npath.join('test', 'mocks', 'test-directory', 'test-2.md')
  )
  fs.copyFileSync(
    npath.join(
      'test',
      'mocks-backup',
      'test-directory',
      'test-subdirectory',
      'test.md'
    ),
    npath.join(
      'test',
      'mocks',
      'test-directory',
      'test-subdirectory',
      'test.md'
    )
  )
}
