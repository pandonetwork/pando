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
* [log](_fiber_index_.fiber.md#log)
* [snapshot](_fiber_index_.fiber.md#snapshot)
* [status](_fiber_index_.fiber.md#status)
* [create](_fiber_index_.fiber.md#create)
* [exists](_fiber_index_.fiber.md#exists)
* [load](_fiber_index_.fiber.md#load)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Fiber**(repository: *[Repository](_index_.repository.md)*, uuid: *`string`*): [Fiber](_fiber_index_.fiber.md)

*Defined in [fiber/index.ts:39](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L39)*

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

*Defined in [fiber/index.ts:14](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L14)*

___
<a id="paths"></a>

###  paths

**● paths**: *`any`*

*Defined in [fiber/index.ts:12](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L12)*

___
<a id="repository"></a>

###  repository

**● repository**: *[Repository](_index_.repository.md)*

*Defined in [fiber/index.ts:13](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L13)*

___
<a id="snapshots"></a>

###  snapshots

**● snapshots**: *`Level`*

*Defined in [fiber/index.ts:15](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L15)*

___
<a id="uuid"></a>

###  uuid

**● uuid**: *`string`*

*Defined in [fiber/index.ts:11](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L11)*

___

## Methods

<a id="_length"></a>

### `<Private>` _length

▸ **_length**(): `Promise`<`number`>

*Defined in [fiber/index.ts:75](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L75)*

**Returns:** `Promise`<`number`>

___
<a id="log"></a>

###  log

▸ **log**(__namedParameters?: *`object`*): `Promise`<`any`>

*Defined in [fiber/index.ts:63](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L63)*

**Parameters:**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| limit | `number` | 10 |

**Returns:** `Promise`<`any`>

___
<a id="snapshot"></a>

###  snapshot

▸ **snapshot**(): `Promise`<`any`>

*Defined in [fiber/index.ts:53](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L53)*

**Returns:** `Promise`<`any`>

___
<a id="status"></a>

###  status

▸ **status**(): `Promise`<`any`>

*Defined in [fiber/index.ts:49](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L49)*

**Returns:** `Promise`<`any`>

___
<a id="create"></a>

### `<Static>` create

▸ **create**(repository: *[Repository](_index_.repository.md)*): `Promise`<[Fiber](_fiber_index_.fiber.md)>

*Defined in [fiber/index.ts:27](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L27)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| repository | [Repository](_index_.repository.md) |

**Returns:** `Promise`<[Fiber](_fiber_index_.fiber.md)>

___
<a id="exists"></a>

### `<Static>` exists

▸ **exists**(repository: *[Repository](_index_.repository.md)*, uuid: *`string`*): `Promise`<`boolean`>

*Defined in [fiber/index.ts:17](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L17)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| repository | [Repository](_index_.repository.md) |
| uuid | `string` |

**Returns:** `Promise`<`boolean`>

___
<a id="load"></a>

### `<Static>` load

▸ **load**(repository: *[Repository](_index_.repository.md)*, uuid: *`string`*): `Promise`<[Fiber](_fiber_index_.fiber.md)>

*Defined in [fiber/index.ts:36](https://github.com/ryhope/pando/blob/a668fa92/packages/repository/src/fiber/index.ts#L36)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| repository | [Repository](_index_.repository.md) |
| uuid | `string` |

**Returns:** `Promise`<[Fiber](_fiber_index_.fiber.md)>

___

