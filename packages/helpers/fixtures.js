const fs = require('fs-extra')
const path = require('path')

const fixtures = {
    files: {
        modify: () => {
            fs.writeFileSync(path.join('test', 'fixtures', 'test.md'), 'modified test file\n', 'utf8')
            fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'test_1.md'), 'modified dir test file 1\n', 'utf8')
            fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'sub', 'test.md'), 'modified sub test file\n', 'utf8')
        },

        delete: () => {
            fs.removeSync(path.join('test', 'fixtures', 'test.md'))
            // fs.removeSync(path.join('test', 'fixtures', 'dir', 'sub', 'test.md'))
        }
    },

    directories: {
        delete: () => {
            fs.removeSync(path.join('test', 'fixtures', 'dir', 'sub'))
        }
    },

    restore: () => {
        fs.ensureDirSync(path.join('test', 'fixtures', 'dir'))
        fs.ensureDirSync(path.join('test', 'fixtures', 'dir', 'sub'))
        fs.writeFileSync(path.join('test', 'fixtures', 'test.md'), 'test file\n', 'utf8')
        fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'test_1.md'), 'dir test file 1\n', 'utf8')
        fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'test_2.md'), 'dir test file 2\n', 'utf8')
        fs.writeFileSync(path.join('test', 'fixtures', 'dir', 'sub', 'test.md'), 'sub test file\n', 'utf8')
    }
}


module.exports = { fixtures }
