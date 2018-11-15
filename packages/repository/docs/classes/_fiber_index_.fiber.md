[@pando/repository](../README.md) > ["fiber/index"](../modules/_fiber_index_.md) > [Fiber](../classes/_fiber_index_.fiber.md)

# Class: Fiber

## Hierarchy

**Fiber**

## Index

### Constructors

* [constructor](_fiber_index_.fiber.md#constructor)

### Properties

* [index](_fiber_index_.fiber.md#index)
* [paths](_fiber_index_.fiber.md#paths)
* [repository](_fiber_index_.fiber.md#repository)
* [snapshots](_fiber_index_.fiber.md#snapshots)
* [uuid](_fiber_index_.fiber.md#uuid)

### Methods

* [_length](_fiber_index_.fiber.md#_length)
* [close](_fiber_index_.fiber.md#close)
* [initialize](_fiber_index_.fiber.md#initialize)
* [log](_fiber_index_.fiber.md#log)
* [open](_fiber_index_.fiber.md#open)
* [revert](_fiber_index_.fiber.md#revert)
* [snapshot](_fiber_index_.fiber.md#snapshot)
* [status](_fiber_index_.fiber.md#status)
* [create](_fiber_index_.fiber.md#create)
* [exists](_fiber_index_.fiber.md#exists)
* [load](_fiber_index_.fiber.md#load)
* [paths](_fiber_index_.fiber.md#paths-1)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Fiber**(repository: *[Repository](_index_.repository.md)*, uuid: *`string`*): [Fiber](_fiber_index_.fiber.md)

*Defined in [fiber/index.ts:83](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L83)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| repository | [Repository](_index_.repository.md) |
| uuid | `string` |

**Returns:** [Fiber](_fiber_index_.fiber.md)

___

## Properties

<a id="index"></a>

###  index

**● index**: *[Index](_fiber_index_index_.index.md)*

*Defined in [fiber/index.ts:31](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L31)*

___
<a id="paths"></a>

###  paths

**● paths**: *`any`*

*Defined in [fiber/index.ts:30](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L30)*

___
<a id="repository"></a>

###  repository

**● repository**: *[Repository](_index_.repository.md)*

*Defined in [fiber/index.ts:28](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L28)*

___
<a id="snapshots"></a>

###  snapshots

**● snapshots**: *`Level`*

*Defined in [fiber/index.ts:32](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L32)*

___
<a id="uuid"></a>

###  uuid

**● uuid**: *`string`*

*Defined in [fiber/index.ts:29](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L29)*

___

## Methods

<a id="_length"></a>

### `<Private>` _length

▸ **_length**(): `Promise`<`number`>

*Defined in [fiber/index.ts:186](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L186)*

**Returns:** `Promise`<`number`>

___
<a id="close"></a>

###  close

▸ **close**(): `Promise`<`void`>

*Defined in [fiber/index.ts:177](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L177)*

**Returns:** `Promise`<`void`>

___
<a id="initialize"></a>

###  initialize

▸ **initialize**(__namedParameters?: *`object`*): `Promise`<[Fiber](_fiber_index_.fiber.md)>

*Defined in [fiber/index.ts:93](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L93)*

**Parameters:**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| mkdir | `boolean` | false |

**Returns:** `Promise`<[Fiber](_fiber_index_.fiber.md)>

___
<a id="log"></a>

###  log

▸ **log**(__namedParameters?: *`object`*): `Promise`<`any`>

*Defined in [fiber/index.ts:156](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L156)*

**Parameters:**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| limit | `number` | 10 |

**Returns:** `Promise`<`any`>

___
<a id="open"></a>

###  open

▸ **open**(): `Promise`<`void`>

*Defined in [fiber/index.ts:168](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L168)*

**Returns:** `Promise`<`void`>

___
<a id="revert"></a>

###  revert

▸ **revert**(id: *`number`*, paths?: *`string`[]*): `Promise`<`any`>

*Defined in [fiber/index.ts:121](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L121)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| id | `number` | - |
| `Default value` paths | `string`[] |  [&#x27;&#x27;] |

**Returns:** `Promise`<`any`>

___
<a id="snapshot"></a>

###  snapshot

▸ **snapshot**(message?: *`string`*): `Promise`<`any`>

*Defined in [fiber/index.ts:111](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L111)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` message | `string` | &quot;n/a&quot; |

**Returns:** `Promise`<`any`>

___
<a id="status"></a>

###  status

▸ **status**(): `Promise`<`any`>

*Defined in [fiber/index.ts:107](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L107)*

**Returns:** `Promise`<`any`>

___
<a id="create"></a>

### `<Static>` create

▸ **create**(repository: *[Repository](_index_.repository.md)*, __namedParameters?: *`object`*): `Promise`<[Fiber](_fiber_index_.fiber.md)>

*Defined in [fiber/index.ts:63](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L63)*

**Parameters:**

**repository: [Repository](_index_.repository.md)**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| open | `boolean` | false |

**Returns:** `Promise`<[Fiber](_fiber_index_.fiber.md)>

___
<a id="exists"></a>

### `<Static>` exists

▸ **exists**(repository: *[Repository](_index_.repository.md)*, uuid: *`string`*): `Promise`<`boolean`>

*Defined in [fiber/index.ts:53](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L53)*

Check if a given fiber exists locally

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| repository | [Repository](_index_.repository.md) |  Repository to check if the fiber exists in. |
| uuid | `string` |  UUID of the fiber. |

**Returns:** `Promise`<`boolean`>
Returns true if the fiber exists locally, returns else otherwise.

___
<a id="load"></a>

### `<Static>` load

▸ **load**(repository: *[Repository](_index_.repository.md)*, uuid: *`string`*): `Promise`<[Fiber](_fiber_index_.fiber.md)>

*Defined in [fiber/index.ts:76](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L76)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| repository | [Repository](_index_.repository.md) |
| uuid | `string` |

**Returns:** `Promise`<[Fiber](_fiber_index_.fiber.md)>

___
<a id="paths-1"></a>

### `<Static>` paths

▸ **paths**(repository: *[Repository](_index_.repository.md)*, uuid: *`string`*, path: *`string`*): `string`

*Defined in [fiber/index.ts:34](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index.ts#L34)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| repository | [Repository](_index_.repository.md) |
| uuid | `string` |
| path | `string` |

**Returns:** `string`

___

