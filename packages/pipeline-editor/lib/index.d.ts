import React from "react";
export declare type Editor<State> = React.FC<{
    state: State;
    setState: (state: State) => void;
}>;
