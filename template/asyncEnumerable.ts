export type AsyncOrSync<T> = Promise<T> | T;
export type AsyncOrSyncIterable<T> = AsyncIterable<T> | Iterable<T>;

async function* emptyGenerator() {
    // Yield nothing
}

export class AsyncEnumerable<T> implements AsyncIterable<T> {

    private static readonly EMPTY_ENUMERABLE = new AsyncEnumerable<any>(emptyGenerator());

    public readonly iterable: AsyncIterable<T>;

    public constructor(iterable: AsyncIterable<T>) {
        this.iterable = iterable;
    }

    [Symbol.asyncIterator](): AsyncIterator<T> {
        return this.iterable[Symbol.asyncIterator]();
    }

    public async toArray(): Promise<T[]> {
        const result = [];
        for await (const element of this.iterable) {
            result.push(element);
        }
        return result;
    }

    public static empty<T>(): AsyncEnumerable<T> {
        return AsyncEnumerable.EMPTY_ENUMERABLE;
    }
}
