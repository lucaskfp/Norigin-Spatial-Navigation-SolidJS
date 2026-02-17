import { createEffect, createSignal, onCleanup } from "solid-js";
import { uniqueId } from "./helpers";
import {
  type Direction,
  type FocusableComponentLayout,
  type FocusDetails,
  type KeyPressDetails,
  SpatialNavigation,
} from "./SpatialNavigation";
import { useFocusContext } from "./useFocusContext";

const noop = (() => {}) as (...args: any[]) => any;

export type EnterPressHandler<P = object> = (
  props: P,
  details: KeyPressDetails,
) => void;

export type EnterReleaseHandler<P = object> = (props: P) => void;

export type ArrowPressHandler<P = object> = (
  direction: string,
  props: P,
  details: KeyPressDetails,
) => boolean;

export type ArrowReleaseHandler<P = object> = (
  direction: string,
  props: P,
) => void;

export type FocusHandler<P = object> = (
  layout: FocusableComponentLayout,
  props: P,
  details: FocusDetails,
) => void;

export type BlurHandler<P = object> = (
  layout: FocusableComponentLayout,
  props: P,
  details: FocusDetails,
) => void;

export interface UseFocusableConfig<P = object> {
  focusable?: boolean;
  saveLastFocusedChild?: boolean;
  trackChildren?: boolean;
  autoRestoreFocus?: boolean;
  forceFocus?: boolean;
  isFocusBoundary?: boolean;
  focusBoundaryDirections?: Direction[];
  focusKey?: string;
  preferredChildFocusKey?: string;
  onEnterPress?: EnterPressHandler<P>;
  onEnterRelease?: EnterReleaseHandler<P>;
  onArrowPress?: ArrowPressHandler<P>;
  onArrowRelease?: ArrowReleaseHandler<P>;
  onFocus?: FocusHandler<P>;
  onBlur?: BlurHandler<P>;
  extraProps?: P;
}

export interface UseFocusableResult<E = HTMLElement> {
  /** Callback ref: assign to ref attribute, e.g. ref={result.ref} */
  ref: (el: E | undefined) => void;
  focusSelf: (focusDetails?: FocusDetails) => void;
  /** Reactive accessor: call as focused() to read */
  focused: () => boolean;
  /** Reactive accessor: call as hasFocusedChild() to read */
  hasFocusedChild: () => boolean;
  focusKey: string;
}

export function createFocusable<
  P = object,
  E extends HTMLElement = HTMLElement,
>(config: UseFocusableConfig<P> = {}): UseFocusableResult<E> {
  const {
    focusable = true,
    saveLastFocusedChild = true,
    trackChildren = false,
    autoRestoreFocus = true,
    forceFocus = false,
    isFocusBoundary = false,
    focusBoundaryDirections,
    focusKey: propFocusKey,
    preferredChildFocusKey,
    onEnterPress = noop as EnterPressHandler<P>,
    onEnterRelease = noop as EnterReleaseHandler<P>,
    onArrowPress = (() => true) as ArrowPressHandler<P>,
    onArrowRelease = noop as ArrowReleaseHandler<P>,
    onFocus = noop as FocusHandler<P>,
    onBlur = noop as BlurHandler<P>,
    extraProps,
  } = config;

  const parentFocusKey = useFocusContext();
  const generatedKey = uniqueId("sn:focusable-item-");
  const focusKey = propFocusKey ?? generatedKey;

  const [nodeSignal, setNode] = createSignal<E | undefined>(undefined);
  const [focused, setFocused] = createSignal(false);
  const [hasFocusedChild, setHasFocusedChild] = createSignal(false);

  const onEnterPressHandler = (details: KeyPressDetails) => {
    onEnterPress(extraProps as P, details);
  };
  const onEnterReleaseHandler = () => {
    onEnterRelease(extraProps as P);
  };
  const onArrowPressHandler = (direction: string, details: KeyPressDetails) =>
    onArrowPress(direction, extraProps as P, details);
  const onArrowReleaseHandler = (direction: string) => {
    onArrowRelease(direction, extraProps as P);
  };
  const onFocusHandler = (
    layout: FocusableComponentLayout,
    details: FocusDetails,
  ) => {
    onFocus(layout, extraProps as P, details);
  };
  const onBlurHandler = (
    layout: FocusableComponentLayout,
    details: FocusDetails,
  ) => {
    onBlur(layout, extraProps as P, details);
  };

  const focusSelf = (focusDetails: FocusDetails = {}) => {
    SpatialNavigation.setFocus(focusKey, focusDetails);
  };

  createEffect(() => {
    const node = nodeSignal();
    if (!node) return;

    SpatialNavigation.addFocusable({
      focusKey,
      node: node as unknown as HTMLElement,
      parentFocusKey,
      preferredChildFocusKey,
      onEnterPress: onEnterPressHandler,
      onEnterRelease: onEnterReleaseHandler,
      onArrowPress: onArrowPressHandler,
      onArrowRelease: onArrowReleaseHandler,
      onFocus: onFocusHandler,
      onBlur: onBlurHandler,
      onUpdateFocus: (isFocused = false) => setFocused(isFocused),
      onUpdateHasFocusedChild: (isFocused = false) =>
        setHasFocusedChild(isFocused),
      saveLastFocusedChild,
      trackChildren,
      isFocusBoundary,
      focusBoundaryDirections,
      autoRestoreFocus,
      forceFocus,
      focusable,
    });

    onCleanup(() => {
      SpatialNavigation.removeFocusable({ focusKey });
    });
  });

  createEffect(() => {
    const node = nodeSignal();
    if (!node) return;

    SpatialNavigation.updateFocusable(focusKey, {
      node: node as unknown as HTMLElement,
      preferredChildFocusKey,
      focusable,
      isFocusBoundary,
      focusBoundaryDirections,
      onEnterPress: onEnterPressHandler,
      onEnterRelease: onEnterReleaseHandler,
      onArrowPress: onArrowPressHandler,
      onArrowRelease: onArrowReleaseHandler,
      onFocus: onFocusHandler,
      onBlur: onBlurHandler,
    });
  });

  const setRef = (el: E | undefined) => {
    setNode(() => el);
  };

  return {
    ref: setRef,
    focusSelf,
    focused,
    hasFocusedChild,
    focusKey,
  };
}

/** @deprecated Use createFocusable. Alias for backwards compatibility. */
export const useFocusable = createFocusable;
