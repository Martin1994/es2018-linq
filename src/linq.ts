import { AsyncOrSyncIterable, AsyncQueryable } from "./asyncQueryable";
import { Queryable } from "./queryable";

export function linq<T>(iterable: Iterable<T>): Queryable<T>;
export function linq<T>(iterable: AsyncIterable<T>): AsyncQueryable<T>;
export function linq<T>(iterable: AsyncOrSyncIterable<T>): Queryable<T> | AsyncQueryable<T> {
    if (isIterable(iterable)) {
        return new Queryable(iterable);
    }

    return new AsyncQueryable(iterable);
}

function isIterable<T>(iterable: AsyncOrSyncIterable<T>): iterable is Iterable<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (iterable as any)[Symbol.iterator];
}
