import { AsyncEnumerable } from "./asyncEnumerable";

function* emptyGenerator() {
    // Yield nothing
}

export class Enumerable<T> implements Iterable<T> {

    private static readonly EMPTY_ENUMERABLE = new Enumerable<any>(emptyGenerator());

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

    public static range(start: number, count: number): Enumerable<number> {
        return new Enumerable(function* (): Iterable<number> {
            for (let i = 0; i < count; i++) {
                yield start + i;
            }
        }());
    }

    public static repeat<T>(element: T, count: number): Enumerable<T> {
        return new Enumerable(function* (): Iterable<T> {
            for (let i = 0; i < count; i++) {
                yield element;
            }
        }());
    }
}
