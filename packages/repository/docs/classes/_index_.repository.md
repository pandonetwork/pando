[@pando/repository](../README.md) > ["index"](../modules/_index_.md) > [Repository](../classes/_index_.repository.md)

# Class: Repository

## Hierarchy

**Repository**

## Index

### Constructors

* [constructor](_index_.repository.md#constructor)

### Properties

* [fibers](_index_.repository.md#fibers)
* [node](_index_.repository.md#node)

### Methods

* [remove](_index_.repository.md#remove)
* [create](_index_.repository.md#create)

### Object literals

* [paths](_index_.repository.md#paths)
* [paths](_index_.repository.md#paths-1)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Repository**(path?: *`string`*, node: *`IPFS`*): [Repository](_index_.repository.md)

*Defined in [index.ts:55](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L55)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` path | `string` | &quot;.&quot; |
| node | `IPFS` | - |

**Returns:** [Repository](_index_.repository.md)

___

## Properties

<a id="fibers"></a>

###  fibers

**● fibers**: *[FiberFactory](_fiber_factory_.fiberfactory.md)*

*Defined in [index.ts:55](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L55)*

___
<a id="node"></a>

###  node

**● node**: *`IPFS`*

*Defined in [index.ts:54](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L54)*

___

## Methods

<a id="remove"></a>

###  remove

▸ **remove**(): `Promise`<`void`>

*Defined in [index.ts:68](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L68)*

**Returns:** `Promise`<`void`>

___
<a id="create"></a>

### `<Static>` create

▸ **create**(path?: *`string`*): `Promise`<[Repository](_index_.repository.md)>

*Defined in [index.ts:29](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L29)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` path | `string` | &quot;.&quot; |

**Returns:** `Promise`<[Repository](_index_.repository.md)>

___

## Object literals

<a id="paths"></a>

###  paths

**paths**: *`object`*

*Defined in [index.ts:53](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L53)*

___
<a id="paths-1"></a>

### `<Static>` paths

**paths**: *`object`*

*Defined in [index.ts:17](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L17)*

<a id="paths-1.config"></a>

####  config

**● config**: *`string`* = ".pando/config"

*Defined in [index.ts:24](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L24)*

___
<a id="paths-1.current"></a>

####  current

**● current**: *`string`* = ".pando/current"

*Defined in [index.ts:23](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L23)*

___
<a id="paths-1.db"></a>

####  db

**● db**: *`string`* = ".pando/db"

*Defined in [index.ts:22](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L22)*

___
<a id="paths-1.fibers-1"></a>

####  fibers

**● fibers**: *`string`* = ".pando/fibers"

*Defined in [index.ts:25](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L25)*

___
<a id="paths-1.index"></a>

####  index

**● index**: *`string`* = ".pando/index"

*Defined in [index.ts:21](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L21)*

___
<a id="paths-1.ipfs"></a>

####  ipfs

**● ipfs**: *`string`* = ".pando/ipfs"

*Defined in [index.ts:20](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L20)*

___
<a id="paths-1.pando"></a>

####  pando

**● pando**: *`string`* = ".pando"

*Defined in [index.ts:19](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L19)*

___
<a id="paths-1.root"></a>

####  root

**● root**: *`string`* = "."

*Defined in [index.ts:18](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/index.ts#L18)*

___

___

