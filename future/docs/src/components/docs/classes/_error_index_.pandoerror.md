[@pando/repository](../README.md) > ["error/index"](../modules/_error_index_.md) > [PandoError](../classes/_error_index_.pandoerror.md)

# Class: PandoError

## Hierarchy

 `ExtendableError`

**↳ PandoError**

## Index

### Constructors

* [constructor](_error_index_.pandoerror.md#constructor)

### Properties

* [message](_error_index_.pandoerror.md#message)
* [name](_error_index_.pandoerror.md#name)
* [stack](_error_index_.pandoerror.md#stack)

### Methods

* [message](_error_index_.pandoerror.md#message-1)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new PandoError**(code: *`string`*, ...args: *`any`[]*): [PandoError](_error_index_.pandoerror.md)

*Defined in [error/index.ts:17](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/error/index.ts#L17)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| code | `string` |
| `Rest` args | `any`[] |

**Returns:** [PandoError](_error_index_.pandoerror.md)

___

## Properties

<a id="message"></a>

###  message

**● message**: *`string`*

*Inherited from ExtendableError.message*

*Overrides Error.message*

*Defined in /Users/osarrouy/Documents/dapp/@pando/packages/repository/node_modules/ts-error/lib/es.d.ts:4*

___
<a id="name"></a>

###  name

**● name**: *`string`*

*Inherited from ExtendableError.name*

*Overrides Error.name*

*Defined in /Users/osarrouy/Documents/dapp/@pando/packages/repository/node_modules/ts-error/lib/es.d.ts:3*

___
<a id="stack"></a>

### `<Optional>` stack

**● stack**: * `undefined` &#124; `string`
*

*Inherited from ExtendableError.stack*

*Overrides Error.stack*

*Defined in /Users/osarrouy/Documents/dapp/@pando/packages/repository/node_modules/ts-error/lib/es.d.ts:5*

___

## Methods

<a id="message-1"></a>

### `<Static>` message

▸ **message**(code: *`string`*, ...args: *`any`[]*): `string`

*Defined in [error/index.ts:6](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/error/index.ts#L6)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| code | `string` |
| `Rest` args | `any`[] |

**Returns:** `string`

___

