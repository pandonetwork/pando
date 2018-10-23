"use strict";
/// <reference path="./testDefinitions/PropTypes.d.ts" />
/// <reference path="./testDefinitions/React.d.ts" />
/// <reference path="./testDefinitions/ReactDOM.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require("react");
var ReactDOM = require("react-dom");
var PropTypes = require("prop-types");
// Before Each
var container;
var attachedListener = null;
var renderedName = null;
var Inner = /** @class */ (function (_super) {
    __extends(Inner, _super);
    function Inner() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Inner.prototype.getName = function () {
        return this.props.name;
    };
    Inner.prototype.render = function () {
        attachedListener = this.props.onClick;
        renderedName = this.props.name;
        return React.createElement('div', { className: this.props.name });
    };
    return Inner;
}(React.Component));
function test(element, expectedTag, expectedClassName) {
    var instance = ReactDOM.render(element, container);
    expect(container.firstChild).not.toBeNull();
    expect(container.firstChild.tagName).toBe(expectedTag);
    expect(container.firstChild.className).toBe(expectedClassName);
    return instance;
}
// Classes need to be declared at the top level scope, so we declare all the
// classes that will be used by the tests below, instead of inlining them.
// TODO: Consider redesigning this using modules so that we can use non-unique
// names of classes and bundle them with the test code.
// it preserves the name of the class for use in error messages
// it throws if no render function is defined
var Empty = /** @class */ (function (_super) {
    __extends(Empty, _super);
    function Empty() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Empty;
}(React.Component));
// it renders a simple stateless component with prop
var SimpleStateless = /** @class */ (function (_super) {
    __extends(SimpleStateless, _super);
    function SimpleStateless() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SimpleStateless.prototype.render = function () {
        return React.createElement(Inner, { name: this.props.bar });
    };
    return SimpleStateless;
}(React.Component));
// it renders based on state using initial values in this.props
var InitialState = /** @class */ (function (_super) {
    __extends(InitialState, _super);
    function InitialState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            bar: _this.props.initialValue,
        };
        return _this;
    }
    InitialState.prototype.render = function () {
        return React.createElement('span', { className: this.state.bar });
    };
    return InitialState;
}(React.Component));
// it renders based on state using props in the constructor
var StateBasedOnProps = /** @class */ (function (_super) {
    __extends(StateBasedOnProps, _super);
    function StateBasedOnProps(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { bar: props.initialValue };
        return _this;
    }
    StateBasedOnProps.prototype.changeState = function () {
        this.setState({ bar: 'bar' });
    };
    StateBasedOnProps.prototype.render = function () {
        if (this.state.bar === 'foo') {
            return React.createElement('div', { className: 'foo' });
        }
        return React.createElement('span', { className: this.state.bar });
    };
    return StateBasedOnProps;
}(React.Component));
// it renders based on context in the constructor
var StateBasedOnContext = /** @class */ (function (_super) {
    __extends(StateBasedOnContext, _super);
    function StateBasedOnContext() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            tag: _this.context.tag,
            className: _this.context.className,
        };
        return _this;
    }
    StateBasedOnContext.prototype.render = function () {
        var Tag = this.state.tag;
        return React.createElement(Tag, { className: this.state.className });
    };
    StateBasedOnContext.contextTypes = {
        tag: PropTypes.string,
        className: PropTypes.string,
    };
    return StateBasedOnContext;
}(React.Component));
var ProvideChildContextTypes = /** @class */ (function (_super) {
    __extends(ProvideChildContextTypes, _super);
    function ProvideChildContextTypes() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProvideChildContextTypes.prototype.getChildContext = function () {
        return { tag: 'span', className: 'foo' };
    };
    ProvideChildContextTypes.prototype.render = function () {
        return React.createElement(StateBasedOnContext);
    };
    ProvideChildContextTypes.childContextTypes = {
        tag: PropTypes.string,
        className: PropTypes.string,
    };
    return ProvideChildContextTypes;
}(React.Component));
// it renders only once when setting state in componentWillMount
var renderCount = 0;
var RenderOnce = /** @class */ (function (_super) {
    __extends(RenderOnce, _super);
    function RenderOnce() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            bar: _this.props.initialValue,
        };
        return _this;
    }
    RenderOnce.prototype.UNSAFE_componentWillMount = function () {
        this.setState({ bar: 'bar' });
    };
    RenderOnce.prototype.render = function () {
        renderCount++;
        return React.createElement('span', { className: this.state.bar });
    };
    return RenderOnce;
}(React.Component));
// it should throw with non-object in the initial state property
var ArrayState = /** @class */ (function (_super) {
    __extends(ArrayState, _super);
    function ArrayState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = ['an array'];
        return _this;
    }
    ArrayState.prototype.render = function () {
        return React.createElement('span');
    };
    return ArrayState;
}(React.Component));
var StringState = /** @class */ (function (_super) {
    __extends(StringState, _super);
    function StringState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = 'a string';
        return _this;
    }
    StringState.prototype.render = function () {
        return React.createElement('span');
    };
    return StringState;
}(React.Component));
var NumberState = /** @class */ (function (_super) {
    __extends(NumberState, _super);
    function NumberState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = 1234;
        return _this;
    }
    NumberState.prototype.render = function () {
        return React.createElement('span');
    };
    return NumberState;
}(React.Component));
// it should render with null in the initial state property
var NullState = /** @class */ (function (_super) {
    __extends(NullState, _super);
    function NullState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = null;
        return _this;
    }
    NullState.prototype.render = function () {
        return React.createElement('span');
    };
    return NullState;
}(React.Component));
// it setState through an event handler
var BoundEventHandler = /** @class */ (function (_super) {
    __extends(BoundEventHandler, _super);
    function BoundEventHandler() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            bar: _this.props.initialValue,
        };
        _this.handleClick = function () {
            _this.setState({ bar: 'bar' });
        };
        return _this;
    }
    BoundEventHandler.prototype.render = function () {
        return React.createElement(Inner, {
            name: this.state.bar,
            onClick: this.handleClick,
        });
    };
    return BoundEventHandler;
}(React.Component));
// it should not implicitly bind event handlers
var UnboundEventHandler = /** @class */ (function (_super) {
    __extends(UnboundEventHandler, _super);
    function UnboundEventHandler() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            bar: _this.props.initialValue,
        };
        return _this;
    }
    UnboundEventHandler.prototype.handleClick = function () {
        this.setState({ bar: 'bar' });
    };
    UnboundEventHandler.prototype.render = function () {
        return React.createElement(Inner, {
            name: this.state.bar,
            onClick: this.handleClick,
        });
    };
    return UnboundEventHandler;
}(React.Component));
// it renders using forceUpdate even when there is no state
var ForceUpdateWithNoState = /** @class */ (function (_super) {
    __extends(ForceUpdateWithNoState, _super);
    function ForceUpdateWithNoState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mutativeValue = _this.props.initialValue;
        return _this;
    }
    ForceUpdateWithNoState.prototype.handleClick = function () {
        this.mutativeValue = 'bar';
        this.forceUpdate();
    };
    ForceUpdateWithNoState.prototype.render = function () {
        return React.createElement(Inner, {
            name: this.mutativeValue,
            onClick: this.handleClick.bind(this),
        });
    };
    return ForceUpdateWithNoState;
}(React.Component));
// it will call all the normal life cycle methods
var lifeCycles = [];
var NormalLifeCycles = /** @class */ (function (_super) {
    __extends(NormalLifeCycles, _super);
    function NormalLifeCycles() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {};
        return _this;
    }
    NormalLifeCycles.prototype.UNSAFE_componentWillMount = function () {
        lifeCycles.push('will-mount');
    };
    NormalLifeCycles.prototype.componentDidMount = function () {
        lifeCycles.push('did-mount');
    };
    NormalLifeCycles.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
        lifeCycles.push('receive-props', nextProps);
    };
    NormalLifeCycles.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        lifeCycles.push('should-update', nextProps, nextState);
        return true;
    };
    NormalLifeCycles.prototype.UNSAFE_componentWillUpdate = function (nextProps, nextState) {
        lifeCycles.push('will-update', nextProps, nextState);
    };
    NormalLifeCycles.prototype.componentDidUpdate = function (prevProps, prevState) {
        lifeCycles.push('did-update', prevProps, prevState);
    };
    NormalLifeCycles.prototype.componentWillUnmount = function () {
        lifeCycles.push('will-unmount');
    };
    NormalLifeCycles.prototype.render = function () {
        return React.createElement('span', { className: this.props.value });
    };
    return NormalLifeCycles;
}(React.Component));
// warns when classic properties are defined on the instance,
// but does not invoke them.
var getInitialStateWasCalled = false;
var getDefaultPropsWasCalled = false;
var ClassicProperties = /** @class */ (function (_super) {
    __extends(ClassicProperties, _super);
    function ClassicProperties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.contextTypes = {};
        _this.contextType = {};
        _this.propTypes = {};
        return _this;
    }
    ClassicProperties.prototype.getDefaultProps = function () {
        getDefaultPropsWasCalled = true;
        return {};
    };
    ClassicProperties.prototype.getInitialState = function () {
        getInitialStateWasCalled = true;
        return {};
    };
    ClassicProperties.prototype.render = function () {
        return React.createElement('span', { className: 'foo' });
    };
    return ClassicProperties;
}(React.Component));
// it should warn when misspelling shouldComponentUpdate
var MisspelledComponent1 = /** @class */ (function (_super) {
    __extends(MisspelledComponent1, _super);
    function MisspelledComponent1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MisspelledComponent1.prototype.componentShouldUpdate = function () {
        return false;
    };
    MisspelledComponent1.prototype.render = function () {
        return React.createElement('span', { className: 'foo' });
    };
    return MisspelledComponent1;
}(React.Component));
// it should warn when misspelling componentWillReceiveProps
var MisspelledComponent2 = /** @class */ (function (_super) {
    __extends(MisspelledComponent2, _super);
    function MisspelledComponent2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MisspelledComponent2.prototype.componentWillRecieveProps = function () {
        return false;
    };
    MisspelledComponent2.prototype.render = function () {
        return React.createElement('span', { className: 'foo' });
    };
    return MisspelledComponent2;
}(React.Component));
// it should warn when misspelling UNSAFE_componentWillReceiveProps
var MisspelledComponent3 = /** @class */ (function (_super) {
    __extends(MisspelledComponent3, _super);
    function MisspelledComponent3() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MisspelledComponent3.prototype.UNSAFE_componentWillRecieveProps = function () {
        return false;
    };
    MisspelledComponent3.prototype.render = function () {
        return React.createElement('span', { className: 'foo' });
    };
    return MisspelledComponent3;
}(React.Component));
// it supports this.context passed via getChildContext
var ReadContext = /** @class */ (function (_super) {
    __extends(ReadContext, _super);
    function ReadContext() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReadContext.prototype.render = function () {
        return React.createElement('div', { className: this.context.bar });
    };
    ReadContext.contextTypes = { bar: PropTypes.string };
    return ReadContext;
}(React.Component));
var ProvideContext = /** @class */ (function (_super) {
    __extends(ProvideContext, _super);
    function ProvideContext() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProvideContext.prototype.getChildContext = function () {
        return { bar: 'bar-through-context' };
    };
    ProvideContext.prototype.render = function () {
        return React.createElement(ReadContext);
    };
    ProvideContext.childContextTypes = { bar: PropTypes.string };
    return ProvideContext;
}(React.Component));
// it supports classic refs
var ClassicRefs = /** @class */ (function (_super) {
    __extends(ClassicRefs, _super);
    function ClassicRefs() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClassicRefs.prototype.render = function () {
        return React.createElement(Inner, { name: 'foo', ref: 'inner' });
    };
    return ClassicRefs;
}(React.Component));
// Describe the actual test cases.
describe('ReactTypeScriptClass', function () {
    beforeEach(function () {
        container = document.createElement('div');
        attachedListener = null;
        renderedName = null;
    });
    it('preserves the name of the class for use in error messages', function () {
        expect(Empty.name).toBe('Empty');
    });
    it('throws if no render function is defined', function () {
        expect(function () {
            return expect(function () {
                return ReactDOM.render(React.createElement(Empty), container);
            }).toThrow();
        }).toWarnDev([
            // A failed component renders twice in DEV
            'Warning: Empty(...): No `render` method found on the returned ' +
                'component instance: you may have forgotten to define `render`.',
            'Warning: Empty(...): No `render` method found on the returned ' +
                'component instance: you may have forgotten to define `render`.',
        ], { withoutStack: true });
    });
    it('renders a simple stateless component with prop', function () {
        test(React.createElement(SimpleStateless, { bar: 'foo' }), 'DIV', 'foo');
        test(React.createElement(SimpleStateless, { bar: 'bar' }), 'DIV', 'bar');
    });
    it('renders based on state using initial values in this.props', function () {
        test(React.createElement(InitialState, { initialValue: 'foo' }), 'SPAN', 'foo');
    });
    it('renders based on state using props in the constructor', function () {
        var instance = test(React.createElement(StateBasedOnProps, { initialValue: 'foo' }), 'DIV', 'foo');
        instance.changeState();
        test(React.createElement(StateBasedOnProps), 'SPAN', 'bar');
    });
    it('sets initial state with value returned by static getDerivedStateFromProps', function () {
        var Foo = /** @class */ (function (_super) {
            __extends(Foo, _super);
            function Foo() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    foo: null,
                    bar: null,
                };
                return _this;
            }
            Foo.getDerivedStateFromProps = function (nextProps, prevState) {
                return {
                    foo: nextProps.foo,
                    bar: 'bar',
                };
            };
            Foo.prototype.render = function () {
                return React.createElement('div', {
                    className: this.state.foo + " " + this.state.bar,
                });
            };
            return Foo;
        }(React.Component));
        test(React.createElement(Foo, { foo: 'foo' }), 'DIV', 'foo bar');
    });
    it('warns if getDerivedStateFromProps is not static', function () {
        var Foo = /** @class */ (function (_super) {
            __extends(Foo, _super);
            function Foo() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Foo.prototype.getDerivedStateFromProps = function () {
                return {};
            };
            Foo.prototype.render = function () {
                return React.createElement('div', {});
            };
            return Foo;
        }(React.Component));
        expect(function () {
            ReactDOM.render(React.createElement(Foo, { foo: 'foo' }), container);
        }).toWarnDev('Foo: getDerivedStateFromProps() is defined as an instance method ' +
            'and will be ignored. Instead, declare it as a static method.', { withoutStack: true });
    });
    it('warns if getDerivedStateFromError is not static', function () {
        var Foo = /** @class */ (function (_super) {
            __extends(Foo, _super);
            function Foo() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Foo.prototype.getDerivedStateFromError = function () {
                return {};
            };
            Foo.prototype.render = function () {
                return React.createElement('div');
            };
            return Foo;
        }(React.Component));
        expect(function () {
            ReactDOM.render(React.createElement(Foo, { foo: 'foo' }), container);
        }).toWarnDev('Foo: getDerivedStateFromError() is defined as an instance method ' +
            'and will be ignored. Instead, declare it as a static method.', { withoutStack: true });
    });
    it('warns if getSnapshotBeforeUpdate is static', function () {
        var Foo = /** @class */ (function (_super) {
            __extends(Foo, _super);
            function Foo() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Foo.getSnapshotBeforeUpdate = function () {
            };
            Foo.prototype.render = function () {
                return React.createElement('div', {});
            };
            return Foo;
        }(React.Component));
        expect(function () {
            ReactDOM.render(React.createElement(Foo, { foo: 'foo' }), container);
        }).toWarnDev('Foo: getSnapshotBeforeUpdate() is defined as a static method ' +
            'and will be ignored. Instead, declare it as an instance method.', { withoutStack: true });
    });
    it('warns if state not initialized before static getDerivedStateFromProps', function () {
        var Foo = /** @class */ (function (_super) {
            __extends(Foo, _super);
            function Foo() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Foo.getDerivedStateFromProps = function (nextProps, prevState) {
                return {
                    foo: nextProps.foo,
                    bar: 'bar',
                };
            };
            Foo.prototype.render = function () {
                return React.createElement('div', {
                    className: this.state.foo + " " + this.state.bar,
                });
            };
            return Foo;
        }(React.Component));
        expect(function () {
            ReactDOM.render(React.createElement(Foo, { foo: 'foo' }), container);
        }).toWarnDev('`Foo` uses `getDerivedStateFromProps` but its initial state is ' +
            'undefined. This is not recommended. Instead, define the initial state by ' +
            'assigning an object to `this.state` in the constructor of `Foo`. ' +
            'This ensures that `getDerivedStateFromProps` arguments have a consistent shape.', { withoutStack: true });
    });
    it('updates initial state with values returned by static getDerivedStateFromProps', function () {
        var Foo = /** @class */ (function (_super) {
            __extends(Foo, _super);
            function Foo() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    foo: 'foo',
                    bar: 'bar',
                };
                return _this;
            }
            Foo.getDerivedStateFromProps = function (nextProps, prevState) {
                return {
                    foo: "not-" + prevState.foo,
                };
            };
            Foo.prototype.render = function () {
                return React.createElement('div', {
                    className: this.state.foo + " " + this.state.bar,
                });
            };
            return Foo;
        }(React.Component));
        test(React.createElement(Foo), 'DIV', 'not-foo bar');
    });
    it('renders updated state with values returned by static getDerivedStateFromProps', function () {
        var Foo = /** @class */ (function (_super) {
            __extends(Foo, _super);
            function Foo() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    value: 'initial',
                };
                return _this;
            }
            Foo.getDerivedStateFromProps = function (nextProps, prevState) {
                if (nextProps.update) {
                    return {
                        value: 'updated',
                    };
                }
                return null;
            };
            Foo.prototype.render = function () {
                return React.createElement('div', { className: this.state.value });
            };
            return Foo;
        }(React.Component));
        test(React.createElement(Foo, { update: false }), 'DIV', 'initial');
        test(React.createElement(Foo, { update: true }), 'DIV', 'updated');
    });
    it('renders based on context in the constructor', function () {
        test(React.createElement(ProvideChildContextTypes), 'SPAN', 'foo');
    });
    it('renders only once when setting state in componentWillMount', function () {
        renderCount = 0;
        test(React.createElement(RenderOnce, { initialValue: 'foo' }), 'SPAN', 'bar');
        expect(renderCount).toBe(1);
    });
    it('should warn with non-object in the initial state property', function () {
        expect(function () { return test(React.createElement(ArrayState), 'SPAN', ''); }).toWarnDev('ArrayState.state: must be set to an object or null', { withoutStack: true });
        expect(function () { return test(React.createElement(StringState), 'SPAN', ''); }).toWarnDev('StringState.state: must be set to an object or null', { withoutStack: true });
        expect(function () { return test(React.createElement(NumberState), 'SPAN', ''); }).toWarnDev('NumberState.state: must be set to an object or null', { withoutStack: true });
    });
    it('should render with null in the initial state property', function () {
        test(React.createElement(NullState), 'SPAN', '');
    });
    it('setState through an event handler', function () {
        test(React.createElement(BoundEventHandler, { initialValue: 'foo' }), 'DIV', 'foo');
        attachedListener();
        expect(renderedName).toBe('bar');
    });
    it('should not implicitly bind event handlers', function () {
        test(React.createElement(UnboundEventHandler, { initialValue: 'foo' }), 'DIV', 'foo');
        expect(attachedListener).toThrow();
    });
    it('renders using forceUpdate even when there is no state', function () {
        test(React.createElement(ForceUpdateWithNoState, { initialValue: 'foo' }), 'DIV', 'foo');
        attachedListener();
        expect(renderedName).toBe('bar');
    });
    it('will call all the normal life cycle methods', function () {
        lifeCycles = [];
        test(React.createElement(NormalLifeCycles, { value: 'foo' }), 'SPAN', 'foo');
        expect(lifeCycles).toEqual(['will-mount', 'did-mount']);
        lifeCycles = []; // reset
        test(React.createElement(NormalLifeCycles, { value: 'bar' }), 'SPAN', 'bar');
        expect(lifeCycles).toEqual([
            'receive-props',
            { value: 'bar' },
            'should-update',
            { value: 'bar' },
            {},
            'will-update',
            { value: 'bar' },
            {},
            'did-update',
            { value: 'foo' },
            {},
        ]);
        lifeCycles = []; // reset
        ReactDOM.unmountComponentAtNode(container);
        expect(lifeCycles).toEqual(['will-unmount']);
    });
    it('warns when classic properties are defined on the instance, ' +
        'but does not invoke them.', function () {
        getInitialStateWasCalled = false;
        getDefaultPropsWasCalled = false;
        expect(function () {
            return test(React.createElement(ClassicProperties), 'SPAN', 'foo');
        }).toWarnDev([
            'getInitialState was defined on ClassicProperties, ' +
                'a plain JavaScript class.',
            'getDefaultProps was defined on ClassicProperties, ' +
                'a plain JavaScript class.',
            'propTypes was defined as an instance property on ClassicProperties.',
            'contextTypes was defined as an instance property on ClassicProperties.',
            'contextType was defined as an instance property on ClassicProperties.',
        ], { withoutStack: true });
        expect(getInitialStateWasCalled).toBe(false);
        expect(getDefaultPropsWasCalled).toBe(false);
    });
    it('does not warn about getInitialState() on class components ' +
        'if state is also defined.', function () {
        var Example = /** @class */ (function (_super) {
            __extends(Example, _super);
            function Example() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {};
                return _this;
            }
            Example.prototype.getInitialState = function () {
                return {};
            };
            Example.prototype.render = function () {
                return React.createElement('span', { className: 'foo' });
            };
            return Example;
        }(React.Component));
        test(React.createElement(Example), 'SPAN', 'foo');
    });
    it('should warn when misspelling shouldComponentUpdate', function () {
        expect(function () {
            return test(React.createElement(MisspelledComponent1), 'SPAN', 'foo');
        }).toWarnDev('Warning: ' +
            'MisspelledComponent1 has a method called componentShouldUpdate(). Did ' +
            'you mean shouldComponentUpdate()? The name is phrased as a question ' +
            'because the function is expected to return a value.', { withoutStack: true });
    });
    it('should warn when misspelling componentWillReceiveProps', function () {
        expect(function () {
            return test(React.createElement(MisspelledComponent2), 'SPAN', 'foo');
        }).toWarnDev('Warning: ' +
            'MisspelledComponent2 has a method called componentWillRecieveProps(). ' +
            'Did you mean componentWillReceiveProps()?', { withoutStack: true });
    });
    it('should warn when misspelling UNSAFE_componentWillReceiveProps', function () {
        expect(function () {
            return test(React.createElement(MisspelledComponent3), 'SPAN', 'foo');
        }).toWarnDev('Warning: ' +
            'MisspelledComponent3 has a method called UNSAFE_componentWillRecieveProps(). ' +
            'Did you mean UNSAFE_componentWillReceiveProps()?', { withoutStack: true });
    });
    it('should throw AND warn when trying to access classic APIs', function () {
        var instance = test(React.createElement(Inner, { name: 'foo' }), 'DIV', 'foo');
        expect(function () {
            return expect(function () { return instance.replaceState({}); }).toThrow();
        }).toLowPriorityWarnDev('replaceState(...) is deprecated in plain JavaScript React classes', { withoutStack: true });
        expect(function () {
            return expect(function () { return instance.isMounted(); }).toThrow();
        }).toLowPriorityWarnDev('isMounted(...) is deprecated in plain JavaScript React classes', { withoutStack: true });
    });
    it('supports this.context passed via getChildContext', function () {
        test(React.createElement(ProvideContext), 'DIV', 'bar-through-context');
    });
    it('supports classic refs', function () {
        var instance = test(React.createElement(ClassicRefs), 'DIV', 'foo');
        expect(instance.refs.inner.getName()).toBe('foo');
    });
    it('supports drilling through to the DOM using findDOMNode', function () {
        var instance = test(React.createElement(Inner, { name: 'foo' }), 'DIV', 'foo');
        var node = ReactDOM.findDOMNode(instance);
        expect(node).toBe(container.firstChild);
    });
});
//# sourceMappingURL=ReactTypeScriptClass-test.js.map