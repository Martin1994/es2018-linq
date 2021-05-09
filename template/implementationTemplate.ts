import { AsyncEnumerable, AsyncOrSync, AsyncOrSyncIterable, AsyncOrderedEnumerable } from "./asyncEnumerable";
import { Enumerable, Grouping } from "./enumerable";

/**
 * A placeholder for code generator.
 *
 * When this is used as the return type of a method, during code generation a wrapper
 * method will be created which returns an AsyncEnumerable instead.
 *
 * @example
 * // Template (this file)
 * public async *echo(): WrapWithAsyncEnumerable<T> {
 *     yield* this.iterable;
 * }
 *
 * // Generated (asyncEnumerable.ts)
 * public echo(): AsyncEnumerable<T> {
 *     return new AsyncEnumerable(this.echoImpl());
 * }
 * private async *echoImpl(): AsyncIterable<T> {
 *     yield* this.iterable;
 * }
 */
type WrapWithAsyncEnumerable<T> = AsyncIterable<T>

abstract class EnumerableTemplate<T> extends AsyncEnumerable<T> {

    public async aggregate<TAccumulate>(
        seed: TAccumulate,
        func: (accumulate: TAccumulate, element: T) => AsyncOrSync<TAccumulate>
    ): Promise<TAccumulate> {
        let accumulate = seed;
        for await (const element of this.iterable) {
            accumulate = await func(accumulate, element);
        }

        return accumulate;
    }

    public async all(predicate: (element: T) => AsyncOrSync<boolean>): Promise<boolean> {
        for await (const element of this.iterable) {
            if (!await predicate(element)) {
                return false;
            }
        }
        return true;
    }

    public any(): Promise<boolean>;
    public any(predicate: (element: T) => AsyncOrSync<boolean>): Promise<boolean>;
    public async any(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<boolean> {
        if (!predicate) {
            predicate = _ => true;
        }

        for await (const element of this.iterable) {
            if (await predicate(element)) {
                return true;
            }
        }
        return false;
    }

    public async *append(element: T): WrapWithAsyncEnumerable<T> {
        yield* this.iterable;
        yield element;
    }

    public async average(DO_NOT_ASSIGN: T extends number ? void : never): Promise<number> {
        let sum = 0;
        let count = 0;
        for await (const element of this.iterable as any as AsyncIterable<number>) {
            sum += element;
            count++;
        }

        if (count === 0) {
            throw new Error("Source contains no elements.");
        }

        return sum / count;
    }

    public async *concat(secondHalf: AsyncOrSyncIterable<T>): WrapWithAsyncEnumerable<T> {
        yield* this.iterable;
        yield* secondHalf;
    }

    public contains(value: T): Promise<boolean>;
    public contains(value: T, comparer: (lhs: T, rhs: T) => AsyncOrSync<boolean>): Promise<boolean>;
    public async contains(value: T, comparer?: (lhs: T, rhs: T) => AsyncOrSync<boolean>): Promise<boolean> {
        if (!comparer) {
            comparer = (lhs, rhs) => lhs === rhs;
        }

        for await (const element of this.iterable) {
            if (await comparer(element, value)) {
                return true;
            }
        }
        return false;
    }

    public count(): Promise<number>;
    public count(predicate: (element: T) => AsyncOrSync<boolean>): Promise<number>;
    public async count(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<number> {
        if (!predicate) {
            predicate = _ => true;
        }

        let counter = 0;
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                counter++;
            }
        }
        return counter;
    }

    public async *defaultIfEmpty(defaultValue: T): WrapWithAsyncEnumerable<T> {
        let empty = true;
        for await (const element of this.iterable) {
            empty = false;
            yield element;
        }

        if (empty) {
            yield defaultValue;
        }
    }

    public async *undefinedIfEmpty(): WrapWithAsyncEnumerable<T | undefined> {
        let empty = true;
        for await (const element of this.iterable) {
            empty = false;
            yield element;
        }

        if (empty) {
            yield undefined;
        }
    }

    public async *distinct(): WrapWithAsyncEnumerable<T> {
        const appeared =  new Set<T>();
        for await (const element of this.iterable) {
            if (!appeared.has(element)) {
                yield element;
                appeared.add(element);
            }
        }
    }

    public async elementAt(index: number): Promise<T | undefined> {
        let i = 0;
        for await (const element of this.iterable) {
            if (i === index) {
                return element;
            }
            i++;
        }
        throw new Error("Out of range.");
    }

    public async elementAtOrUndefined(index: number): Promise<T | undefined> {
        let i = 0;
        for await (const element of this.iterable) {
            if (i === index) {
                return element;
            }
            i++;
        }
        return undefined;
    }

    public async *except(that: AsyncOrSyncIterable<T>): WrapWithAsyncEnumerable<T> {
        const thisSet = new Set<T>();
        const thatSet = new Set<T>();
        for await (const thatElement of that) {
            thatSet.add(thatElement);
        }
        for await (const thisElement of this.iterable) {
            if (!thisSet.has(thisElement) && !thatSet.has(thisElement)) {
                yield thisElement;
                thisSet.add(thisElement);
            }
        }
    }

    public first(): Promise<T>;
    public first(predicate: (element: T) => AsyncOrSync<boolean>): Promise<T>;
    public async first(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<T> {
        if (!predicate) {
            predicate = _ => true;
        }

        for await (const element of this.iterable) {
            if (await predicate(element)) {
                return element;
            }
        }
        throw new Error("No element is found.");
    }

    public firstOrUndefined(): Promise<T | undefined>;
    public firstOrUndefined(predicate: (element: T) => AsyncOrSync<boolean>): Promise<T | undefined>;
    public async firstOrUndefined(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<T | undefined> {
        if (!predicate) {
            predicate = _ => true;
        }

        for await (const element of this.iterable) {
            if (await predicate(element)) {
                return element;
            }
        }
        return undefined;
    }

    public groupBy<TKey>(
        keySelector: (element: T) => AsyncOrSync<TKey>
    ): WrapWithAsyncEnumerable<Grouping<TKey, T>>;

    public groupBy<TKey, TElement>(
        keySelector: (element: T) => AsyncOrSync<TKey>,
        elementSelector: (element: T) => AsyncOrSync<TElement>,
    ): WrapWithAsyncEnumerable<Grouping<TKey, TElement>>;

    public groupBy<TKey, TElement, TResult>(
        keySelector: (element: T) => AsyncOrSync<TKey>,
        elementSelector: (element: T) => AsyncOrSync<TElement>,
        resultSelector: (key: TKey, results: Iterable<TElement>) => AsyncOrSync<TResult>
    ): WrapWithAsyncEnumerable<TResult>;

    public async *groupBy<TKey, TElement = T, TResult = Grouping<TKey, TElement>>(
        keySelector: (element: T) => AsyncOrSync<TKey>,
        elementSelector?: (element: T) => AsyncOrSync<TElement>,
        resultSelector?: (key: TKey, results: Iterable<TElement>) => AsyncOrSync<TResult>
    ): WrapWithAsyncEnumerable<TResult> {
        if (!elementSelector) {
            elementSelector = element => element as any; // Should only be used when TElement is not given
        }

        if (!resultSelector) {
            resultSelector = (key, results) => new Grouping(key, results) as any; // Should only be used when TResult is not given
        }

        const groupMap = new Map<TKey, TElement[]>();
        for await (const element of this.iterable) {
            const key = await keySelector(element);
            let list = groupMap.get(key);
            if (!list) {
                list = [];
                groupMap.set(key, list);
            }

            list.push(await elementSelector(element));
        }

        for (const [key, results] of groupMap) {
            yield resultSelector(key, results);
        }
    }

    public async *groupJoin<TInner, TKey, TResult>(
        inner: AsyncOrSyncIterable<TInner>,
        outerKeySelector: (element: T) => AsyncOrSync<TKey>,
        innerKeySelector: (element: TInner) => AsyncOrSync<TKey>,
        resultSelector: (outerElement: T, innerElements: Iterable<TInner>) => AsyncOrSync<TResult>
    ): WrapWithAsyncEnumerable<TResult> {
        const innerMap = new Map<TKey, TInner[]>();
        for await (const innerElement of inner) {
            const key = await innerKeySelector(innerElement);
            let list = innerMap.get(key);
            if (!list) {
                list = [];
                innerMap.set(key, list);
            }

            list.push(innerElement);
        }

        for await (const outerElement of this.iterable) {
            const key = await outerKeySelector(outerElement);
            const innerElements: Iterable<TInner> = innerMap.get(key) || Enumerable.empty();
            yield resultSelector(outerElement, innerElements);
        }
    }

    public async *intersect(that: AsyncOrSyncIterable<T>): WrapWithAsyncEnumerable<T> {
        const thisSet = new Set<T>();
        const thatSet = new Set<T>();
        for await (const thatElement of that) {
            thatSet.add(thatElement);
        }
        for await (const thisElement of this.iterable) {
            if (!thisSet.has(thisElement) && thatSet.has(thisElement)) {
                yield thisElement;
                thisSet.add(thisElement);
            }
        }
    }

    public async *join<TInner, TKey, TResult>(
        inner: AsyncOrSyncIterable<TInner>,
        outerKeySelector: (element: T) => AsyncOrSync<TKey>,
        innerKeySelector: (element: TInner) => AsyncOrSync<TKey>,
        resultSelector: (outerElement: T, innerElement: TInner) => AsyncOrSync<TResult>
    ): WrapWithAsyncEnumerable<TResult> {
        const innerMap = new Map<TKey, TInner[]>();
        for await (const innerElement of inner) {
            const key = await innerKeySelector(innerElement);
            let list = innerMap.get(key);
            if (!list) {
                list = [];
                innerMap.set(key, list);
            }

            list.push(innerElement);
        }

        for await (const outerElement of this.iterable) {
            const key = await outerKeySelector(outerElement);
            const innerElements: Iterable<TInner> | undefined = innerMap.get(key);
            if (innerElements) {
                for (const innerElement of innerElements) {
                    yield resultSelector(outerElement, innerElement);
                }
            }
        }
    }

    public last(): Promise<T>;
    public last(predicate: (element: T) => AsyncOrSync<boolean>): Promise<T>;
    public async last(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<T> {
        if (!predicate) {
            predicate = _ => true;
        }

        let found = false;
        let last: T | undefined = undefined;
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                last = element;
                found = true;
            }
        }
        if (found) {
            return last!;
        } else {
            throw new Error("No element is found.");
        }
    }

    public lastOrUndefined(): Promise<T | undefined>;
    public lastOrUndefined(predicate: (element: T) => AsyncOrSync<boolean>): Promise<T | undefined>;
    public async lastOrUndefined(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<T | undefined> {
        if (!predicate) {
            predicate = _ => true;
        }

        let last: T | undefined = undefined;
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                last = element;
            }
        }
        return last;
    }

    public async max(DO_NOT_ASSIGN: T extends number ? void : never): Promise<number> {
        const generator = (this.iterable as any as AsyncIterable<number>)[Symbol.asyncIterator]();

        let next = await generator.next();
        if (next.done) {
            throw new Error("Source contains no elements.");
        }
        let max = next.value;

        while (!(next = await generator.next()).done) {
            if (next.value > max) {
                max = next.value;
            }
        }
        return max;
    }

    public async min(DO_NOT_ASSIGN: T extends number ? void : never): Promise<number> {
        const generator = (this.iterable as any as AsyncIterable<number>)[Symbol.asyncIterator]();

        let next = await generator.next();
        if (next.done) {
            throw new Error("Source contains no elements.");
        }
        let min = next.value;

        while (!(next = await generator.next()).done) {
            if (next.value < min) {
                min = next.value;
            }
        }
        return min;
    }

    public orderBy<TKey>(keySelector: (element: T) => TKey): AsyncOrderedEnumerable<T>;
    public orderBy<TKey>(keySelector: (element: T) => TKey, comparer: (lhs: TKey, rhs: TKey) => AsyncOrSync<number>): AsyncOrderedEnumerable<T>;
    public orderBy<TKey>(keySelector: (element: T) => TKey, comparer?: (lhs: TKey, rhs: TKey) => AsyncOrSync<number>): AsyncOrderedEnumerable<T> {
        if (comparer) {
            return new AsyncOrderedEnumerable(this.iterable, (lhs: T, rhs: T) => comparer(keySelector(lhs), keySelector(rhs)));
        } else {
            return new AsyncOrderedEnumerable(this.iterable, (lhs: T, rhs: T) => {
                const lKey = keySelector(lhs);
                const rKey = keySelector(rhs);
                if (lKey === rKey) {
                    return 0;
                }
                return lKey < rKey ? -1 : 1;
            });
        }
    }

    public orderByDescending<TKey>(keySelector: (element: T) => TKey): AsyncOrderedEnumerable<T>;
    public orderByDescending<TKey>(keySelector: (element: T) => TKey, comparer: (lhs: TKey, rhs: TKey) => AsyncOrSync<number>): AsyncOrderedEnumerable<T>;
    public orderByDescending<TKey>(keySelector: (element: T) => TKey, comparer?: (lhs: TKey, rhs: TKey) => AsyncOrSync<number>): AsyncOrderedEnumerable<T> {
        if (comparer) {
            return new AsyncOrderedEnumerable(this.iterable, (lhs: T, rhs: T) => comparer(keySelector(rhs), keySelector(lhs)));
        } else {
            return new AsyncOrderedEnumerable(this.iterable, (lhs: T, rhs: T) => {
                const lKey = keySelector(lhs);
                const rKey = keySelector(rhs);
                if (lKey === rKey) {
                    return 0;
                }
                return rKey < lKey ? -1 : 1;
            });
        }
    }

    public async *prepend(element: T): WrapWithAsyncEnumerable<T> {
        yield element;
        yield* this.iterable;
    }

    public async *reverse(): WrapWithAsyncEnumerable<T> {
        yield* (await this.toArray()).reverse();
    }

    public async *select<TResult>(selector: (element: T, index: number) => AsyncOrSync<TResult>): WrapWithAsyncEnumerable<TResult> {
        let i = 0;
        for await (const element of this.iterable) {
            yield selector(element, i);
            i++;
        }
    }

    public selectMany<TResult>(
        selector: (element: T, index: number) => AsyncOrSyncIterable<TResult>
    ): WrapWithAsyncEnumerable<TResult>;

    public selectMany<TCollection, TResult>(
        collectionSelector: (element: T, index: number) => AsyncOrSyncIterable<TCollection>,
        resultSelector: (element: T, collectionElement: TCollection) => AsyncOrSync<TResult>
    ): WrapWithAsyncEnumerable<TResult>;

    public async *selectMany<TCollection, TResult = TCollection>(
        collectionSelector: (element: T, index: number) => AsyncOrSyncIterable<TCollection>,
        resultSelector?: (element: T, collectionElement: TCollection) => AsyncOrSync<TResult>
    ): WrapWithAsyncEnumerable<TResult> {
        if (!resultSelector) {
            resultSelector = (_, x) => x as any; // Should only be used when resultSelector is not given
        }

        let i = 0;
        for await (const element of this.iterable) {
            for await (const selected of collectionSelector(element, i)) {
                yield resultSelector(element, selected);
            }
            i++;
        }
    }

    public async sequenceEqual(that: AsyncOrSyncIterable<T>): Promise<boolean>;
    public async sequenceEqual(that: AsyncOrSyncIterable<T>, comparer: (lhs: T, rhs: T) => AsyncOrSync<boolean>): Promise<boolean>;
    public async sequenceEqual(that: AsyncOrSyncIterable<T>, comparer?: (lhs: T, rhs: T) => AsyncOrSync<boolean>): Promise<boolean> {
        if (!comparer) {
            comparer = (lhs, rhs) => lhs === rhs;
        }

        const thisGenerator = this.iterable[Symbol.asyncIterator]();

        for await (const thatElement of that) {
            const thisIteration = await thisGenerator.next();

            if (thisIteration.done) {
                return false;
            }

            if (!await comparer(thatElement, thisIteration.value)) {
                return false;
            }
        }

        if (!(await thisGenerator.next()).done) {
            return false;
        }

        return true;
    }

    public async single(): Promise<T>;
    public async single(predicate: (element: T) => AsyncOrSync<boolean>): Promise<T>;
    public async single(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<T> {
        if (!predicate) {
            predicate = _ => true;
        }

        let found: boolean = false;
        let result: T | undefined = undefined;

        for await (const element of this.iterable) {
            if (await predicate(element)) {
                if (found) {
                    throw new Error("More than one element is found.");
                }

                found = true;
                result = element;
            }
        }

        if (!found) {
            throw new Error("No element is found.");
        }

        return result!;
    }

    public async singleOrUndefined(): Promise<T | undefined>;
    public async singleOrUndefined(predicate: (element: T) => AsyncOrSync<boolean>): Promise<T | undefined>;
    public async singleOrUndefined(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<T | undefined> {
        if (!predicate) {
            predicate = _ => true;
        }

        let found: boolean = false;
        let result: T | undefined = undefined;

        for await (const element of this.iterable) {
            if (await predicate(element)) {
                if (found) {
                    throw new Error("More than one element is found.");
                }

                found = true;
                result = element;
            }
        }

        return result;
    }

    public async *skip(count: number): WrapWithAsyncEnumerable<T> {
        let i = 0;
        for await (const element of this.iterable) {
            if (i >= count) {
                yield element;
            }
            i++;
        }
    }

    public async *skipLast(count: number): WrapWithAsyncEnumerable<T> {
        const buffer = new Array(count);

        let i = 0;
        let bufferFull = false;
        for await (const element of this.iterable) {
            if (bufferFull) {
                yield buffer[i];
            }

            buffer[i] = element;

            i++;
            if (i >= count) {
                i = 0;
                bufferFull = true;
            }
        }
    }

    public async *skipWhile(predicate: (element: T, index: number) => AsyncOrSync<boolean>): WrapWithAsyncEnumerable<T> {
        let skip = true;
        let i = 0;
        for await (const element of this.iterable) {
            if (skip) {
                if (await predicate(element, i)) {
                    i++;
                    continue;
                }
                skip = false;
            }

            yield element;
        }
    }

    public async sum(DO_NOT_ASSIGN: T extends number ? void : never): Promise<number> {
        let sum = 0;
        for await (const element of this.iterable as any as AsyncIterable<number>) {
            sum += element;
        }
        return sum;
    }

    public async *take(count: number): WrapWithAsyncEnumerable<T> {
        let i = 0;
        for await (const element of this.iterable) {
            if (i < count) {
                yield element;
            }
            i++;
        }
    }

    public async *takeLast(count: number): WrapWithAsyncEnumerable<T> {
        const buffer = new Array(count);

        let i = 0;
        let bufferFull = false;
        for await (const element of this.iterable) {
            buffer[i] = element;

            i++;
            if (i >= count) {
                i = 0;
                bufferFull = true;
            }
        }

        if (bufferFull) {
            for (let j = i; j < count; j++) {
                yield buffer[j];
            }
        }
        for (let j = 0; j < i; j++) {
            yield buffer[j];
        }
    }

    public async *takeWhile(predicate: (element: T, index: number) => AsyncOrSync<boolean>): WrapWithAsyncEnumerable<T> {
        let i = 0;
        for await (const element of this.iterable) {
            if (await predicate(element, i)) {
                i++;

                yield element;
            } else {
                return;
            }
        }
    }

    public async toMap<TKey>(keySelector: (element: T) => AsyncOrSync<TKey>): Promise<Map<TKey, T>> {
        const result = new Map<TKey, T>();

        for await (const element of this.iterable) {
            result.set(await keySelector(element), element);
        }

        return result;
    }

    public async toSet(): Promise<Set<T>> {
        const result = new Set<T>();

        for await (const element of this.iterable) {
            result.add(element);
        }

        return result;
    }

    public async *union(that: AsyncOrSyncIterable<T>): WrapWithAsyncEnumerable<T> {
        const thisSet = new Set<T>();
        const thatSet = new Set<T>();
        for await (const thatElement of that) {
            thatSet.add(thatElement);
        }
        for await (const thisElement of this.iterable) {
            if (!thisSet.has(thisElement)) {
                yield thisElement;
                thisSet.add(thisElement);
            }
            thatSet.delete(thisElement);
        }
        yield* thatSet;
    }

    public async *where(predicate: (element: T) => AsyncOrSync<boolean>): WrapWithAsyncEnumerable<T> {
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                yield element;
            }
        }
    }

    public zip<TThat>(that: AsyncOrSyncIterable<TThat>): WrapWithAsyncEnumerable<[T, TThat]>;
    public zip<TThat, TResult>(that: AsyncOrSyncIterable<TThat>, resultSelector: (first: T, second: TThat) => AsyncOrSync<TResult>): WrapWithAsyncEnumerable<TResult>;
    public async *zip<TThat, TResult = [T, TThat]>(that: AsyncOrSyncIterable<TThat>, resultSelector?: (first: T, second: TThat) => AsyncOrSync<TResult>): WrapWithAsyncEnumerable<TResult> {
        if (!resultSelector) {
            resultSelector = (first, second) => [first, second] as any; // Should only be used when TResult is not given
        }

        const thisGenerator = this.iterable[Symbol.asyncIterator]();

        for await (const thatElement of that) {
            const thisIteration = await thisGenerator.next();

            if (thisIteration.done) {
                break;
            }

            yield resultSelector(thisIteration.value, thatElement);
        }
    }
}

abstract class OrderedEnumerableTemplate<T> extends EnumerableTemplate<T> {
    // Placeholder
    public readonly comparer: (lhs: T, rhs: T) => AsyncOrSync<number> = 0 as any;

    /**
     * @override
     */
    protected get iterable(): AsyncIterable<T> {
        return this.createSortedIterable();
    }

    private async *createSortedIterable(): AsyncIterable<T> {
        const array: T[] = [];
        for await (const element of this.originalIterable) {
            array.push(element);
        }

        if (array.length === 0) {
            return;
        }

        yield* this.sort(array, 0, array.length);
    }

    /**
     * A stable sort algorithm
     */
    private async *sort(source: T[], start: number, end: number): AsyncIterable<T> {
        // Merge sort
        const length = end - start;
        if (length === 1) {
            yield source[start];
            return;
        }

        const middle = start + Math.ceil(length / 2);
        const firstHalf = this.sort(source, start, middle)[Symbol.asyncIterator]();
        const secondHalf = this.sort(source, middle, end)[Symbol.asyncIterator]();

        let firstHalfElement = await firstHalf.next();
        let secondHalfElement = await secondHalf.next();
        while (!firstHalfElement.done || !secondHalfElement.done) {
            if (firstHalfElement.done) {
                yield secondHalfElement.value;
                secondHalfElement = await secondHalf.next();
            } else if (secondHalfElement.done) {
                yield firstHalfElement.value;
                firstHalfElement = await firstHalf.next();
            } else if (await this.comparer(firstHalfElement.value, secondHalfElement.value) <= 0) {
                yield firstHalfElement.value;
                firstHalfElement = await firstHalf.next();
            } else {
                yield secondHalfElement.value;
                secondHalfElement = await secondHalf.next();
            }
        }
    }

    public thenBy<TKey>(keySelector: (element: T) => TKey): AsyncOrderedEnumerable<T>;
    public thenBy<TKey>(keySelector: (element: T) => TKey, comparer: (lhs: TKey, rhs: TKey) => AsyncOrSync<number>): AsyncOrderedEnumerable<T>;
    public thenBy<TKey>(keySelector: (element: T) => TKey, comparer?: (lhs: TKey, rhs: TKey) => AsyncOrSync<number>): AsyncOrderedEnumerable<T> {
        if (comparer) {
            return new AsyncOrderedEnumerable(this.iterable, async (lhs: T, rhs: T) => {
                const innerComparison = await this.comparer(lhs, rhs);
                if (innerComparison !== 0) {
                    return innerComparison;
                }
                return await comparer(keySelector(lhs), keySelector(rhs));
            });
        } else {
            return new AsyncOrderedEnumerable(this.iterable, async (lhs: T, rhs: T) => {
                const innerComparison = await this.comparer(lhs, rhs);
                if (innerComparison !== 0) {
                    return innerComparison;
                }
                const lKey = keySelector(lhs);
                const rKey = keySelector(rhs);
                if (lKey === rKey) {
                    return 0;
                }
                return lKey < rKey ? -1 : 1;
            });
        }
    }

    public thenByDescending<TKey>(keySelector: (element: T) => TKey): AsyncOrderedEnumerable<T>;
    public thenByDescending<TKey>(keySelector: (element: T) => TKey, comparer: (lhs: TKey, rhs: TKey) => AsyncOrSync<number>): AsyncOrderedEnumerable<T>;
    public thenByDescending<TKey>(keySelector: (element: T) => TKey, comparer?: (lhs: TKey, rhs: TKey) => AsyncOrSync<number>): AsyncOrderedEnumerable<T> {
        if (comparer) {
            return new AsyncOrderedEnumerable(this.iterable, async (lhs: T, rhs: T) => {
                const innerComparison = await this.comparer(lhs, rhs);
                if (innerComparison !== 0) {
                    return innerComparison;
                }
                return await comparer(keySelector(rhs), keySelector(lhs));
            });
        } else {
            return new AsyncOrderedEnumerable(this.iterable, async (lhs: T, rhs: T) => {
                const innerComparison = await this.comparer(lhs, rhs);
                if (innerComparison !== 0) {
                    return innerComparison;
                }
                const lKey = keySelector(lhs);
                const rKey = keySelector(rhs);
                if (lKey === rKey) {
                    return 0;
                }
                return rKey < lKey ? -1 : 1;
            });
        }
    }
}
