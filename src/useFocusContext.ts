import { createContext, useContext } from "solid-js";
import { ROOT_FOCUS_KEY } from "./SpatialNavigation";

export const FocusContext = createContext<string>(ROOT_FOCUS_KEY);

/** @internal */
export const useFocusContext = (): string =>
  useContext(FocusContext) ?? ROOT_FOCUS_KEY;
