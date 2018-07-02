Pando

pando is a distributed cooperation system built on top of IPFS, AragonOS and the Ethereum blockchain. The core goals of pando are:

1. To provide humanity a non-censorable cooperation apparatus. Pando's object are stored over IPFS and pando's governance system are based on the Ethereum blockchain. This makes content produced with pando non-censorable.

2. 



a pando's specimen repository consists of 




one way to think about pando is to see it as a distributed version of a versioning system like git. Another way pando is a way to track and enforce historical evolution inspired by how an ecosystem grows and evolves in time


the fibre of a specimen is also a fibre of history

You're no longer a maintainer or a contributor who has authroity on the repo: you're an individual who propose weaves into a specimen.


- what it means to enforce immutability over a cooperation and versioning system?

- what it means to enforce authority tracking over a cooperation and versioning system?

- what it means to enforce a continuous and liquid authority mechanism ?


## Differences between git and pando

As explained in the introduction of this WP the choice of developing a native distributed cooperation system instead of leveraging git built-in mechanisms is motivated by various reasons:

### Addressing

Git uses its own addressing system to identify git objects. Git's addressing system rely on the SHA-1 hash algorithm while Ethereum privileged built-in algorithm is keccak-256. IPFS on its side 
 

### Immutability

### Authority





## Specimen

A specimen consists in dao whose function are :

a. To enforce governance over the specimen itself.
b. To enforce control over the modification of a specimen's fiber.
c. To enforce control over the distribution of authority between its contributor.


#### Properties

fibre
clones
token



### Fibre
A fibre describes the history of a specimen's content. It consists in a merkle-tree of commit objects. 


consists in an merkle-tree of historically linked commit objects. You can think of it as an equivalent of a git's branch. The main differences between pando's specimen and git's branches are the following:

1. Pando's specimen only have one fibre.

2. Pando's fibre history is forward only: you cannot modify or revert to the past of of pando's specimen. This constraints is requested to maintain coherency between authority and history.
fibres weaving is a append-only process: you can not modify or erase the past of a fibre - and thus of a specimen.





fibres defines a history 


pando init 


### Arcs / fiber

An arc / fiber consists in a local version of specimen. One can work as much as he want on his local arcs. An arc / fiber becomes a specimen once its uploaded to the blockchain. 

You can work locally on different fibers but specimen only hold for one fiber

A fibre is a local version of a specimen history. Fibers can track the evolution of a specimen or not.


fibers are weft together to produce new fibers 

<!-- 
   |
 __|
|  | 
|  |
|__| two fibres merges to create a new fibre
   |
   -->
  
  
  a working directory can handle multiple fibres if you need to work on multiple versions of the same material in //
  
  fibres can track one or multiple specimens fibers lets say i have create a new specimen to work on the V2 of a software. I can simultneously track V1 and V2 


pando stage < name > | --all

pando commit --message --tags 



pando specimen new [--specimen-name <name>]


---
pando specimen clone <specimen address> [--name <name>] [--inheritance <percentage>]

Create a new specimen whose current fibre is identical to the cloned specimen's current fibre
---


pando fibre extract <specimen address> --fiber-name <name> --specimen-name <name>




pando fibre new <name> --from <specimen address>
pando fibre checkout <fibre name>
pando fibre delete <fibre name>
pando fi

pando fiber --add-specimen <adress>:name

pando fiber --remove-specimen < address | name >

pando fetch < specimen name > 

pando weave --type = < expand | merge > < fiber? = current working fiber > [--specimen <specimen>]



pando weave status

pando weave log



### A colony : un reroupement de specimen -> réservé à wespr





### Weaving Process

When one pushes a commit proposal - i.e. an history proposal - its sends: a. cid, b. validity_proof, c. staking

there are multiple types of weacing process: a. continuation, b. merge 



1. The Colony smart contract checks if the commit proposal is valid i.e. if its a descendent of the current history tree as tracked by the Imperium.

2. The Imperium smart contract pushes the cid of the commit proposal into the list of the opened commit proposals. This opens up a clockdown of SUBMISSION_PERIOD.

3. Members of the Imperium DAO can rate the submitted proposal - up to the number of token  they have authority on. If their rate is strictly superior to zero they must also precise a NGT amount / currency of tokens as a reward.

The numbers of NGT granted is equal to the average pondéré des tokens proposés




pando submit --specimen 0xfdsfdsfs

pando checkout --specimen 0x0gtod9r


### Request for submission

pando submit --specimen --rfp id

on fait pareil sauf que pour être accepté il faut ET le quorum ET la part minimale mais aussi LA REWARD MINIMALE



### Clone and inheritance process


#### The need for a new model of token



A clone with 100% authority distributed is like a branch. A clone with 0% authority is like a fork.


Difference between a branch and a fork is mostly an authority issue: who owns right over the new repository / branch. The same people (branch) or new people (fork)

It does not makes sense when authority is not a bynary concept - i onw authority or not - but a more continuous ones (through NGT)

So for instance for a branch it's like a clone / fork but where you copy the integral history of the minime-token representing the parent NGT


donc on clone avec un certain pourcentage d'inheritance de l'autorité du parent et balanceOf(x) = balanceOfNativeOrCHildToken(x) + balanceOfParentToken(x) x percentage et totalBalance = totalOfNative + percentage * totalofPArent

l'autorité gagnée dans les specimen enfants ne remonte pas dans le specimen parent mais l'autorité gagnée dans le parent se répercute dans l'enfant

Il faut donc créer un système de token hierarchique

Quand tu merge: tu peux redistribue les autorités des enfants dans le parent (comme ça si l'enfant du merge a d'autres parents ça leur transmet de l'autorité aussi)

par exemple si le merge d'une branch se voit octroyer (par le process du chapitre précédent) 10% de token alors ces 10% sont redistribués dans l'autorité nouvelle à hauteur des parts de chacun dans l'autorité de la branche qui vient de merger

la différence entre un merge et un fork c'est que le merge est static. Une fois que le merge est intégré le specimen devient mort et réintègre le specimen dans lequel il est mergé; les compteurs sont remis à zéro


balance

// `balances` is the map that tracks the balance of each address, in this
//  contract when the balance changes the block number that the change
//  occurred is also included in the map
mapping (address => Checkpoint[]) balances;



struct  Checkpoint {

        // `fromBlock` is the block number that the value was generated from
        uint128 fromBlock;

        // `value` is the amount of tokens at a specific block number
        uint128 value;
    }


NOUS

balanceOf(owner) = 

balances[owner][]


MERGE = ANASTOMOSE





### Colony (relationship)

A DAO

### Branch

A branch consists in a historical merkle-tree of commit objects. The difference between pando's branches and git's branches is that pando's branches are forward-only: you cannot modify or update the path of a pando's branch. 






