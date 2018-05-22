// @flow

export type ExtractReturnType = <V>((...args: any[]) => V) => V;
export type $ReturnType<Fn> = $Call<<T>((...Iterable<any>) => T) => T, Fn>;
