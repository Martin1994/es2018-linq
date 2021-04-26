export type AsyncOrSync<T> = Promise<T> | T;
export type AsyncOrSyncIterable<T> = AsyncIterable<T> | Iterable<T>;

export class AsyncQueryable<T> implements AsyncIterable<T> {

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
}
