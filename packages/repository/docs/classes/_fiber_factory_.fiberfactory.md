[@pando/repository](../README.md) > ["fiber/factory"](../modules/_fiber_factory_.md) > [FiberFactory](../classes/_fiber_factory_.fiberfactory.md)

# Class: FiberFactory

## Hierarchy

**FiberFactory**

## Index

### Constructors

* [constructor](_fiber_factory_.fiberfactory.md#constructor)

### Properties

* [db](_fiber_factory_.fiberfactory.md#db)
* [repository](_fiber_factory_.fiberfactory.md#repository)

### Methods

* [_stash](_fiber_factory_.fiberfactory.md#_stash)
* [_unstash](_fiber_factory_.fiberfactory.md#_unstash)
* [create](_fiber_factory_.fiberfactory.md#create)
* [current](_fiber_factory_.fiberfactory.md#current)
* [list](_fiber_factory_.fiberfactory.md#list)
* [load](_fiber_factory_.fiberfactory.md#load)
* [switch](_fiber_factory_.fiberfactory.md#switch)
* [uuid](_fiber_factory_.fiberfactory.md#uuid)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new FiberFactory**(repository: *[Repository](_index_.repository.md)*): [FiberFactory](_fiber_factory_.fiberfactory.md)

*Defined in [fiber/factory.ts:14](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/factory.ts#L14)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| repository | [Repository](_index_.repository.md) |

**Returns:** [FiberFactory](_fiber_factory_.fiberfactory.md)

___

## Properties

<a id="db"></a>

###  db

**● db**: *`Level`*

*Defined in [fiber/factory.ts:14](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/factory.ts#L14)*

___
<a id="repository"></a>

###  repository

**● repository**: *[Repository](_index_.repository.md)*

*Defined in [fiber/factory.ts:13](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/factory.ts#L13)*

___

## Methods

<a id="_stash"></a>

### `<Private>` _stash

▸ **_stash**(uuid: *`string`*, __namedParameters?: *`object`*): `Promise`<`any`>

*Defined in [fiber/factory.ts:165](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/factory.ts#L165)*

**Parameters:**

**uuid: `string`**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| copy | `boolean` | false |

**Returns:** `Promise`<`any`>

___
<a id="_unstash"></a>

### `<Private>` _unstash

▸ **_unstash**(uuid: *`string`*): `Promise`<`any`>

*Defined in [fiber/factory.ts:206](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/factory.ts#L206)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| uuid | `string` |

**Returns:** `Promise`<`any`>

___
<a id="create"></a>

###  create

▸ **create**(name: *`string`*, __namedParameters?: *`object`*): `Promise`<[Fiber](_fiber_index_.fiber.md)>

*Defined in [fiber/factory.ts:73](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/factory.ts#L73)*

**Parameters:**

**name: `string`**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| fork | `boolean` | true |
| open | `boolean` | false |

**Returns:** `Promise`<[Fiber](_fiber_index_.fiber.md)>

___
<a id="current"></a>

###  current

▸ **current**(__namedParameters?: *`object`*): `Promise`< [Fiber](_fiber_index_.fiber.md) &#124; `string` &#124; `undefined`>

*Defined in [fiber/factory.ts:44](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/factory.ts#L44)*

**Parameters:**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| uuid | `boolean` | false |

**Returns:** `Promise`< [Fiber](_fiber_index_.fiber.md) &#124; `string` &#124; `undefined`>

___
<a id="list"></a>

###  list

▸ **list**(): `Promise`<`any`>

*Defined in [fiber/factory.ts:97](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/factory.ts#L97)*

**Returns:** `Promise`<`any`>

___
<a id="load"></a>

###  load

▸ **load**(name: *`string`*, __namedParameters?: *`object`*): `Promise`<[Fiber](_fiber_index_.fiber.md)>

*Defined in [fiber/factory.ts:91](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/factory.ts#L91)*

**Parameters:**

**name: `string`**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| uuid | `boolean` | false |

**Returns:** `Promise`<[Fiber](_fiber_index_.fiber.md)>

___
<a id="switch"></a>

###  switch

▸ **switch**(name: *`string`*, __namedParameters?: *`object`*): `Promise`<`any`>

*Defined in [fiber/factory.ts:115](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/factory.ts#L115)*

**Parameters:**

**name: `string`**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| stash | `boolean` | true |

**Returns:** `Promise`<`any`>

___
<a id="uuid"></a>

###  uuid

▸ **uuid**(name: *`string`*): `Promise`<`string`>

*Defined in [fiber/factory.ts:22](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/factory.ts#L22)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `Promise`<`string`>

___

