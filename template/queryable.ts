import { AsyncQueryable } from "./asyncQueryable";

export class Queryable<T> implements Iterable<T> {
    public readonly iterable: Iterable<T>;

    public constructor(iterable: Iterable<T>) {
        this.iterable = iterable;
    }

    [Symbol.iterator](): Iterator<T> {
        return this.iterable[Symbol.iterator]();
    }

    public toArray(): T[] {
        return [...this.iterable];
    }

    public asAsync(): AsyncQueryable<T> {
        return new AsyncQueryable(this.asAsyncImpl());
    }

    private async *asAsyncImpl(): AsyncIterable<T> {
        for (const element of this.iterable) {
            yield element;
        }
    }
}
