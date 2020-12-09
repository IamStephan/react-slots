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
/**
 * Configuration options for plug.
 */
export interface PlugOptions {
    /**
     * User-friendly display name.
     *
     * This can be used by the target slot e.g. for displaying your plug name in a menu or for debugging purposes.
     */
    name?: string;
    /**
     * Requested display order.
     *
     * This number is relative to the slot that renders the plug.
     * For plugs that should render before others, some low or negative number can be passed
     * so that the plug is inserted at the beginning.
     *
     * However, it is up to slot to respect the order
     */
    order?: number;
    /**
     * Any other data that should be kept with plug.
     *
     * The structure and semantics of this field are defined by the target slot.
     */
    extra?: any;
}
/**
 * PlugHandler function additional fields that get assigned to it
 */
interface PlugMeta extends PlugOptions {
    /**
     * Unique ID for plug instance.
     *
     * Can be used as a `key` prop during rendering.
     */
    readonly id: string;
    /**
     * Name of slot plug is connecting to.
     */
    readonly slotName: string;
}
/**
 * Type for a dynamic plug.
 */
export declare type PlugInstance<Params = {}, Result = React.ReactElement> = ((props: Params) => Result) & PlugMeta;
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
export declare function useSlot<P = {}, R = React.ReactElement>(name: string): readonly PlugInstance<P, R>[];
/**
 * `Slot` component props.
 */
export interface SlotProps<P = undefined, R = React.ReactElement> {
    /**
     * Slot name to render.
     */
    name: string;
    /**
     * Limit of how many plugs should be rendered.
     */
    maxCount?: number;
    /**
     * Whenever plugs should be rendered in reverse order.
     */
    reversed?: boolean;
    /**
     * Parameter to pass to plugs.
     *
     * This field is mutually exclusive with `children` field.
     */
    params?: P;
    /**
     * Optional render function.
     *
     * Function takes pre-processed list of plugs (reversed and limited if specified in other props)
     * and should return a React element (e.g. a fragment).
     *
     * This field is mutually exclusive with `params` field.
     *
     * @param plugs
     */
    children?: (plugs: readonly PlugInstance<P, R>[]) => React.ReactElement;
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
export declare function Slot<T>(props: React.PropsWithoutRef<SlotProps<T>>): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.FunctionComponentElement<{}>;
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
export declare function usePlug<T = {}, R = React.ReactElement>(slot: string, id: string, renderer: (props: T) => R, deps: any[], options: PlugOptions): void;
/**
 * Plug component properties.
 *
 * @see Plug
 */
export interface PlugProps<P = {}, R = React.ReactElement> extends PlugOptions {
    /**
     * Name of the slot to connect to
     */
    slot: string;
    /**
     * Unique name of the plug
     */
    id: string;
    /**
     * Children can be either a casual React elements or a render function
     */
    children: React.ReactNode | React.ReactElement[] | ((props: P) => R);
    /**
     * Optional array of dependencies to trigger the update
     */
    deps?: any[];
}
declare type Plug<P = {}, R = React.ReactElement> = React.FC<PlugProps<P, R>>;
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
export declare const Plug: Plug;
/**
 * Slot component with a defined name.
 */
export declare type BoundPlugComponent<P, R> = React.FC<Omit<PlugProps<P, R>, 'slot'>>;
/**
 * Plug component bound to a Slot.
 */
export declare type BoundSlotComponent<P, R> = React.FC<Omit<SlotProps<P, R>, 'name'>> & {
    slotName: string;
    Plug: BoundPlugComponent<P, R>;
};
/**
 * Creates a named Slot component.
 *
 * @param name Name of the slot
 */
export declare function createSlot<P, R = React.ReactElement>(name: string): BoundSlotComponent<P, R>;
/**
 * Creates a named Slot component and a Plug component bound to it.
 *
 * This is the recommended way to create slots.
 *
 * @param name Name of the slot
 */
export declare function createSlotAndPlug<P = {}, R = React.ReactElement>(name: string): [BoundSlotComponent<P, R>, BoundPlugComponent<P, R>];
/**
 * Component that provides slot and plugs context down the component tree.
 *
 * This component is required for `Plug` and `Slot` components to work.
 */
export declare const SlotProvider: React.FC;
export {};
