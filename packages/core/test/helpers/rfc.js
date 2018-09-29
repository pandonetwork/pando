const RFC_STATUS = ['OPEN', 'MERGED', 'REJECTED', 'CANCELLED'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

const RFC_STATE = ['PENDING', 'VALUATED', 'SORTED'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

const RFC_SORTING = ['MERGE', 'REJECT'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})


const submittedRFCId = receipt => receipt.logs.filter(x => x.event == 'SubmitRFC')[0].args.rfcId

const sortedRFCCommitId = receipt => {
    if (receipt.logs.filter(x => x.event == 'NewCommit')[0]) {
        return receipt.logs.filter(x => x.event == 'NewCommit')[0].args.commitId
    } else {
        return undefined
    }
}

module.exports = {
    RFC_STATUS,
    RFC_STATE,
    RFC_SORTING,
    submittedRFCId,
    sortedRFCCommitId
}
