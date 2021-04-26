import { AsyncEnumerable, AsyncOrSyncIterable } from "./asyncEnumerable";
import { Enumerable } from "./enumerable";

export function from<T>(iterable: Iterable<T>): Enumerable<T>;
export function from<T>(iterable: AsyncIterable<T>): AsyncEnumerable<T>;
export function from<T>(iterable: AsyncOrSyncIterable<T>): Enumerable<T> | AsyncEnumerable<T> {
    if (isIterable(iterable)) {
        return new Enumerable(iterable);
    }

    return new AsyncEnumerable(iterable);
}

function isIterable<T>(iterable: AsyncOrSyncIterable<T>): iterable is Iterable<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (iterable as any)[Symbol.iterator];
}
