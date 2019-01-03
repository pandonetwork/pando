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
* [exists](_index_.repository.md#exists)
* [load](_index_.repository.md#load)

### Object literals

* [paths](_index_.repository.md#paths)
* [paths](_index_.repository.md#paths-1)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Repository**(path?: *`string`*, node: *`IPFS`*): [Repository](_index_.repository.md)

*Defined in [index.ts:34](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L34)*

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

*Defined in [index.ts:34](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L34)*

___
<a id="node"></a>

###  node

**● node**: *`IPFS`*

*Defined in [index.ts:33](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L33)*

___

## Methods

<a id="remove"></a>

###  remove

▸ **remove**(): `Promise`<`void`>

*Defined in [index.ts:108](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L108)*

**Returns:** `Promise`<`void`>

___
<a id="create"></a>

### `<Static>` create

▸ **create**(path?: *`string`*): `Promise`<[Repository](_index_.repository.md)>

*Defined in [index.ts:59](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L59)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` path | `string` | &quot;.&quot; |

**Returns:** `Promise`<[Repository](_index_.repository.md)>

___
<a id="exists"></a>

### `<Static>` exists

▸ **exists**(path?: *`string`*): `Promise`<`boolean`>

*Defined in [index.ts:47](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L47)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` path | `string` | &quot;.&quot; |

**Returns:** `Promise`<`boolean`>

___
<a id="load"></a>

### `<Static>` load

▸ **load**(path?: *`string`*): `Promise`<[Repository](_index_.repository.md)>

*Defined in [index.ts:82](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L82)*

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

*Defined in [index.ts:32](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L32)*

___
<a id="paths-1"></a>

### `<Static>` paths

**paths**: *`object`*

*Defined in [index.ts:18](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L18)*

<a id="paths-1.config"></a>

####  config

**● config**: *`string`* = ".pando/config"

*Defined in [index.ts:25](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L25)*

___
<a id="paths-1.current"></a>

####  current

**● current**: *`string`* = ".pando/current"

*Defined in [index.ts:24](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L24)*

___
<a id="paths-1.db"></a>

####  db

**● db**: *`string`* = ".pando/db"

*Defined in [index.ts:23](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L23)*

___
<a id="paths-1.fibers-1"></a>

####  fibers

**● fibers**: *`string`* = ".pando/fibers"

*Defined in [index.ts:26](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L26)*

___
<a id="paths-1.index"></a>

####  index

**● index**: *`string`* = ".pando/index"

*Defined in [index.ts:22](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L22)*

___
<a id="paths-1.ipfs"></a>

####  ipfs

**● ipfs**: *`string`* = ".pando/ipfs"

*Defined in [index.ts:21](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L21)*

___
<a id="paths-1.pando"></a>

####  pando

**● pando**: *`string`* = ".pando"

*Defined in [index.ts:20](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L20)*

___
<a id="paths-1.root"></a>

####  root

**● root**: *`string`* = "."

*Defined in [index.ts:19](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/index.ts#L19)*

___

___

