import { AsyncEnumerable } from "./asyncEnumerable";

export class Enumerable<T> implements Iterable<T> {

    private static readonly EMPTY_ENUMERABLE = new Enumerable<any>([]);

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

    public asAsync(): AsyncEnumerable<T> {
        return new AsyncEnumerable(this.asAsyncImpl());
    }

    private async *asAsyncImpl(): AsyncIterable<T> {
        for (const element of this.iterable) {
            yield element;
        }
    }

    public static empty<T>(): Enumerable<T> {
        return Enumerable.EMPTY_ENUMERABLE;
    }
}
