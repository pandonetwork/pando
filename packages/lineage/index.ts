

export default class Lineage {

    public who: string // ethereum address
    public as:  string // ipfs or swarm cid pointing to data schema
    public for / with: object // metadata
    public parents: Lineage[]
}

// examples

new Lineage({ who: '0x9f8', as: 'submitter', for: { snapshot:  } })

new Lineage({ who: '0x9f8', as: 'genesis', for: { genesis: '0xregerger',  tree: '/ipfs/QwAwesomeHash' } })

new Lineage({ who: '0x9f8', as: 'developer', for: { snapshot: '/ipfs/QwAwesomeSnapshotHash', files: ['file_1', 'sub/file_2'] } })

new Lineage({ who: '0x9f8', as: 'article', for: { content: '/ipfs/QwAwesomeSnapshotHash', files: ['file_1', 'sub/file_2'] } })
