import * as lib from './scripts'

test('Fetch commit from IPFS and return typed object', async () => {
    const commit = await lib.fetchCommit('QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uc')
    console.log(commit)
});