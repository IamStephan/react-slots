var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
/**
 * Provides `Slot` and `Plug` mechanic.
 *
 * `Slot`s are places that other components can mount to using `Plug`s.
 * To define a slot mount-point, use `<Slot name="name" />`.
 *
 * @example
 * <SlotsProvider>
 *   <header>
 *     <Slot name="header" />
 *   </header>
 *
 *   <Plug slot="header" header="user-view">
 *     Im mouted in header!
 *   </Plug>
 * </SlotsProvider>
 *
 * @example
 *
 * // type-safe API
 * const [SomeSlot, SomePlug] = createSlotAndPlug("some-slot");
 *
 * const SomeComponent = () => (
 *   <>
 *     <SomeSlot />
 *     <SomePlug>test</SomePlug>
 *   </>
 * );
 *
 * @example
 *
 * // type-safe API
 * const SomeSlot = createSlot("some-slot");
 *
 * const SomeComponent = () => (
 *   <>
 *     <SomeSlot />
 *     <SomeSlot.Plug>test</SomeSlot.Plug>
 *   </>
 * );
 *
 * @see Slot
 * @see Plug
 * @see SlotProvider
 */
import * as React from 'react';
import sortBy from 'lodash.sortby';
/**
 * Context instance of this module.
 */
const context = React.createContext(null);
/**
 * Hook that returns all plugs for specified slot name.
 *
 * This hook is meant for advanced use or more fine-grained control.
 * For most cases the `Slot` component, or `createSlot` should be used.
 *
 * In case no plugs have been registered or slot was not yet defined,
 * empty array is returned.
 *
 * @param name Slot name to fetch
 */
export function useSlot(name) {
    const ctx = React.useContext(context);
    if (!ctx) {
        throw new Error("Using <Slot> component or useSlot hook outside of <SlotProvider>");
    }
    return ctx.slots[name] || [];
}
/**
 * React component that renders all registered plugs for specified slot name.
 *
 * Rendering can be customized using render function as children.
 *
 * @example
 *
 * <Slot name="header" />
 *
 * @example
 *
 *  <Slot name="header">
 *    {plugs => (
 *      <React.Fragment>
 *        {plugs.map(Plug => (
 *          <Plug key={Plug.id} myCustomProp={5} />
 *        ))}
 *      </React.Fragment>
 *    )}
 *  </Slot>
 */
export function Slot(props) {
    const { name, maxCount, reversed, children, params } = props, rest = __rest(props, ["name", "maxCount", "reversed", "children", "params"]);
    let slots = useSlot(name);
    if (params && children) {
        throw Error("Cannot specify render function and params props at the same time");
    }
    return React.useMemo(() => {
        if (maxCount !== undefined) {
            slots = slots.slice(0, maxCount);
        }
        if (reversed !== undefined) {
            slots = [...slots].reverse();
        }
        if (children) {
            return children(slots);
        }
        return (React.createElement(React.Fragment, {}, slots.map((R, i) => React.createElement(R, Object.assign({ key: i.toString() }, params)))));
    }, [reversed, maxCount, params, slots, children]);
}
/**
 * Creates a hook that defines a new plug.
 *
 * This function is rather low-level and probably `<Plug>` component
 * or `createSlotAndPlug` is a better choice.
 *
 * @param slot Slot name
 * @param id Unique plug name
 * @param renderer Function to render components
 * @param deps Array of dependencies to trigger the update
 * @param options Additional plug options
 * @see createSlotAndPlug
 * @see createSlot
 * @see Plug
 */
export function usePlug(slot, id, renderer, deps, options) {
    const slotContext = React.useContext(context);
    if (!slotContext) {
        throw new Error("Using <Plug> component or usePlug hook outside of <SlotProvider>");
    }
    const { setPlug, removePlug } = slotContext;
    const { name, order, extra } = options;
    Object.assign(renderer, { slotName: name, extra, order });
    // Using layouteffect to prevent ui jumps
    React.useLayoutEffect(() => {
        setPlug(slot, id, renderer);
        return () => removePlug(slot, id);
    }, deps);
}
/**
 * Plug component.
 *
 * Connects to specified slot and adds `children` to it.
 *
 * Children of this component can be normal react sub-components that will be mounted in the
 * target slot, or a render function can take slot parameters.
 *
 * Slot name should be imported from target module to prevent any typing errors.
 * More type-safe approach is to use `createSlotAndPlug` that creates a slot and plug components
 * with bound name.
 *
 * @param slot Name of the target slot
 * @param id Unique name of the plug
 * @param deps Optional list of dependencies to trigger the update
 * @param children Contents to mount to slot
 * @param options Additional plug options
 */
export const Plug = (_a) => {
    var { slot, id, deps = [], children } = _a, options = __rest(_a, ["slot", "id", "deps", "children"]);
    const renderer = (typeof children === 'function') ? children : () => children;
    usePlug(slot, id, renderer, deps, options);
    return null;
};
/**
 * Creates a named Slot component.
 *
 * @param name Name of the slot
 */
export function createSlot(name) {
    const slot = (props) => React.createElement(Slot, Object.assign({ name }, props));
    slot.slotName = name;
    slot.Plug = createPlugComponent(name);
    return slot;
}
function createPlugComponent(slotName) {
    const plugComponent = (props) => React.createElement(Plug, Object.assign({ slot: slotName }, props));
    plugComponent.displayName = `Slot(${slotName})`;
    return plugComponent;
}
/**
 * Creates a named Slot component and a Plug component bound to it.
 *
 * This is the recommended way to create slots.
 *
 * @param name Name of the slot
 */
export function createSlotAndPlug(name) {
    const boundSlot = createSlot(name);
    return [boundSlot, boundSlot.Plug];
}
/**
 * Component that provides slot and plugs context down the component tree.
 *
 * This component is required for `Plug` and `Slot` components to work.
 */
export const SlotProvider = ({ children }) => {
    const setPlug = (slot, id, renderer) => {
        Object.assign(renderer, { id });
        setSlots((prevState) => (Object.assign(Object.assign({}, prevState), { slots: Object.assign(Object.assign({}, prevState.slots), { [slot]: sortBy([...(prevState.slots[slot] || []).filter(e => e.id !== id), renderer], e => e.order || 0) }) })));
    };
    const removePlug = (slot, name) => {
        setSlots((prevState) => (Object.assign(Object.assign({}, prevState), { slots: Object.assign(Object.assign({}, prevState.slots), { [slot]: sortBy((prevState.slots[slot] || []).filter((e) => e.id !== name), e => e.order || 0) }) })));
    };
    const initialSlots = {
        slots: {},
        setPlug,
        removePlug,
    };
    const [slots, setSlots] = React.useState(initialSlots);
    return (React.createElement(context.Provider, { value: slots }, children));
};
//# sourceMappingURL=slots.js.map