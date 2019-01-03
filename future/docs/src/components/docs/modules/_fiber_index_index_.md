[@pando/repository](../README.md) > ["fiber/index/index"](../modules/_fiber_index_index_.md)

# External module: "fiber/index/index"

## Index

### Classes

* [Index](../classes/_fiber_index_index_.index.md)

### Variables

* [ignore](_fiber_index_index_.md#ignore)

---

## Variables

<a id="ignore"></a>

### `<Const>` ignore

**● ignore**: *`Transform`* =  through2.obj(function (item, enc, next) {
    // console.log(item.path)
    // console.log('IGNORE')
    if (!item.stats.isDirectory() && item.path.indexOf('.pando') < 0) {
        this.push(item)
    }
    next()
})

*Defined in [fiber/index/index.ts:18](https://github.com/ryhope/pando/blob/21d335be/packages/repository/src/fiber/index/index.ts#L18)*

___

