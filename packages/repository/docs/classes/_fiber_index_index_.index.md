[@pando/repository](../README.md) > ["fiber/index/index"](../modules/_fiber_index_index_.md) > [Index](../classes/_fiber_index_index_.index.md)

# Class: Index

## Hierarchy

**Index**

## Index

### Constructors

* [constructor](_fiber_index_index_.index.md#constructor)

### Properties

* [db](_fiber_index_index_.index.md#db)
* [fiber](_fiber_index_index_.index.md#fiber)

### Accessors

* [node](_fiber_index_index_.index.md#node)
* [repository](_fiber_index_index_.index.md#repository)

### Methods

* [_ls](_fiber_index_index_.index.md#_ls)
* [cid](_fiber_index_index_.index.md#cid)
* [clean](_fiber_index_index_.index.md#clean)
* [current](_fiber_index_index_.index.md#current)
* [extract](_fiber_index_index_.index.md#extract)
* [snapshot](_fiber_index_index_.index.md#snapshot)
* [status](_fiber_index_index_.index.md#status)
* [track](_fiber_index_index_.index.md#track)
* [untrack](_fiber_index_index_.index.md#untrack)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Index**(fiber: *[Fiber](_fiber_index_.fiber.md)*): [Index](_fiber_index_index_.index.md)

*Defined in [fiber/index/index.ts:49](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L49)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fiber | [Fiber](_fiber_index_.fiber.md) |

**Returns:** [Index](_fiber_index_index_.index.md)

___

## Properties

<a id="db"></a>

###  db

**● db**: *`Level`*

*Defined in [fiber/index/index.ts:49](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L49)*

___
<a id="fiber"></a>

###  fiber

**● fiber**: *[Fiber](_fiber_index_.fiber.md)*

*Defined in [fiber/index/index.ts:48](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L48)*

___

## Accessors

<a id="node"></a>

###  node

getnode(): `IPFS`

*Defined in [fiber/index/index.ts:60](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L60)*

**Returns:** `IPFS`

___
<a id="repository"></a>

###  repository

getrepository(): [Repository](_index_.repository.md)

*Defined in [fiber/index/index.ts:56](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L56)*

**Returns:** [Repository](_index_.repository.md)

___

## Methods

<a id="_ls"></a>

### `<Private>` _ls

▸ **_ls**(): `Promise`<`any`>

*Defined in [fiber/index/index.ts:118](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L118)*

**Returns:** `Promise`<`any`>

___
<a id="cid"></a>

###  cid

▸ **cid**(path: *`string`*): `Promise`<`string`>

*Defined in [fiber/index/index.ts:266](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L266)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| path | `string` |

**Returns:** `Promise`<`string`>

___
<a id="clean"></a>

### `<Private>` clean

▸ **clean**(path: *`string`*): `Promise`<`void`>

*Defined in [fiber/index/index.ts:312](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L312)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| path | `string` |

**Returns:** `Promise`<`void`>

___
<a id="current"></a>

###  current

▸ **current**(): `Promise`<`any`>

*Defined in [fiber/index/index.ts:64](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L64)*

**Returns:** `Promise`<`any`>

___
<a id="extract"></a>

### `<Private>` extract

▸ **extract**(paths: *`string`[]*, index: *`any`*): `string`[]

*Defined in [fiber/index/index.ts:329](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L329)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| paths | `string`[] |
| index | `any` |

**Returns:** `string`[]

___
<a id="snapshot"></a>

###  snapshot

▸ **snapshot**(opts?: *`any`*): `Promise`<`any`>

*Defined in [fiber/index/index.ts:273](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L273)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` opts | `any` |

**Returns:** `Promise`<`any`>

___
<a id="status"></a>

###  status

▸ **status**(): `Promise`<`any`>

*Defined in [fiber/index/index.ts:146](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L146)*

**Returns:** `Promise`<`any`>

___
<a id="track"></a>

###  track

▸ **track**(paths: *`string`[]*): `Promise`<`any`>

*Defined in [fiber/index/index.ts:88](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L88)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| paths | `string`[] |

**Returns:** `Promise`<`any`>

___
<a id="untrack"></a>

###  untrack

▸ **untrack**(paths: *`string`[]*): `Promise`<`any`>

*Defined in [fiber/index/index.ts:103](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index/index.ts#L103)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| paths | `string`[] |

**Returns:** `Promise`<`any`>

___

