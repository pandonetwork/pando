const RFI_STATE = ['PENDING', 'MERGED', 'REJECTED', 'CANCELLED'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

const RFL_STATE = ['PENDING', 'VALUATED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'ISSUED'].reduce((state, key, index) => {
    state[key] = index
    return state
}, {})

module.exports = { RFI_STATE, RFL_STATE}
