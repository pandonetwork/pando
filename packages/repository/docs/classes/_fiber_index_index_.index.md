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
* [initialize](_fiber_index_index_.index.md#initialize)
* [snapshot](_fiber_index_index_.index.md#snapshot)
* [status](_fiber_index_index_.index.md#status)
* [track](_fiber_index_index_.index.md#track)
* [untrack](_fiber_index_index_.index.md#untrack)
* [for](_fiber_index_index_.index.md#for)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Index**(fiber: *[Fiber](_fiber_index_.fiber.md)*): [Index](_fiber_index_index_.index.md)

*Defined in [fiber/index/index.ts:38](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L38)*

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

*Defined in [fiber/index/index.ts:38](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L38)*

___
<a id="fiber"></a>

###  fiber

**● fiber**: *[Fiber](_fiber_index_.fiber.md)*

*Defined in [fiber/index/index.ts:37](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L37)*

___

## Accessors

<a id="node"></a>

###  node

getnode(): `IPFS`

*Defined in [fiber/index/index.ts:55](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L55)*

**Returns:** `IPFS`

___
<a id="repository"></a>

###  repository

getrepository(): [Repository](_index_.repository.md)

*Defined in [fiber/index/index.ts:51](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L51)*

**Returns:** [Repository](_index_.repository.md)

___

## Methods

<a id="_ls"></a>

### `<Private>` _ls

▸ **_ls**(): `Promise`<`any`>

*Defined in [fiber/index/index.ts:123](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L123)*

**Returns:** `Promise`<`any`>

___
<a id="cid"></a>

###  cid

▸ **cid**(path: *`string`*): `Promise`<`string`>

*Defined in [fiber/index/index.ts:271](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L271)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| path | `string` |

**Returns:** `Promise`<`string`>

___
<a id="clean"></a>

### `<Private>` clean

▸ **clean**(path: *`string`*): `Promise`<`void`>

*Defined in [fiber/index/index.ts:301](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L301)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| path | `string` |

**Returns:** `Promise`<`void`>

___
<a id="current"></a>

###  current

▸ **current**(): `Promise`<`any`>

*Defined in [fiber/index/index.ts:59](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L59)*

**Returns:** `Promise`<`any`>

___
<a id="extract"></a>

###  extract

▸ **extract**(paths: *`string`[]*, index: *`any`*): `string`[]

*Defined in [fiber/index/index.ts:317](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L317)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| paths | `string`[] |
| index | `any` |

**Returns:** `string`[]

___
<a id="initialize"></a>

###  initialize

▸ **initialize**(): `Promise`<[Index](_fiber_index_index_.index.md)>

*Defined in [fiber/index/index.ts:45](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L45)*

**Returns:** `Promise`<[Index](_fiber_index_index_.index.md)>

___
<a id="snapshot"></a>

###  snapshot

▸ **snapshot**(opts?: *`any`*): `Promise`<`any`>

*Defined in [fiber/index/index.ts:278](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L278)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` opts | `any` |

**Returns:** `Promise`<`any`>

___
<a id="status"></a>

###  status

▸ **status**(): `Promise`<`any`>

*Defined in [fiber/index/index.ts:151](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L151)*

**Returns:** `Promise`<`any`>

___
<a id="track"></a>

###  track

▸ **track**(paths: *`string`[]*): `Promise`<`any`>

*Defined in [fiber/index/index.ts:83](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L83)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| paths | `string`[] |

**Returns:** `Promise`<`any`>

___
<a id="untrack"></a>

###  untrack

▸ **untrack**(paths: *`string`[]*): `Promise`<`any`>

*Defined in [fiber/index/index.ts:108](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L108)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| paths | `string`[] |

**Returns:** `Promise`<`any`>

___
<a id="for"></a>

### `<Static>` for

▸ **for**(fiber: *[Fiber](_fiber_index_.fiber.md)*): `Promise`<[Index](_fiber_index_index_.index.md)>

*Defined in [fiber/index/index.ts:30](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L30)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fiber | [Fiber](_fiber_index_.fiber.md) |

**Returns:** `Promise`<[Index](_fiber_index_index_.index.md)>

___

