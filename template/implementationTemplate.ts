import { AsyncOrSync, AsyncOrSyncIterable } from "./asyncEnumerable";
import { Enumerable, Grouping } from "./enumerable";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EnumerableImplementationTemplate<T> {

    private readonly iterable: AsyncIterable<T>;

    private readonly toArray: () => Promise<T[]> = () => Promise.resolve([]);

    private constructor(iterable: AsyncIterable<T>) {
        this.iterable = iterable;
    }

    private async aggregate<TAccumulate>(
        seed: TAccumulate,
        func: (accumulate: TAccumulate, element: T) => AsyncOrSync<TAccumulate>
    ): Promise<TAccumulate> {
        let accumulate = seed;
        for await (const element of this.iterable) {
            accumulate = await func(accumulate, element);
        }

        return accumulate;
    }

    private async all(predicate: (element: T) => AsyncOrSync<boolean>): Promise<boolean> {
        for await (const element of this.iterable) {
            if (!await predicate(element)) {
                return false;
            }
        }
        return true;
    }

    private async any(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<boolean> {
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

    private async *append(element: T): AsyncIterable<T> {
        yield* this.iterable;
        yield element;
    }

    private async average(DO_NOT_ASSIGN: T extends number ? void : never): Promise<number> {
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

    private async *concat(secondHalf: AsyncOrSyncIterable<T>): AsyncIterable<T> {
        yield* this.iterable;
        yield* secondHalf;
    }

    private async contains(value: T, comparer?: (lhs: T, rhs: T) => AsyncOrSync<boolean>): Promise<boolean> {
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

    private async count(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<number> {
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

    private async *defaultIfEmpty(defaultValue: T): AsyncIterable<T> {
        let empty = true;
        for await (const element of this.iterable) {
            empty = false;
            yield element;
        }

        if (empty) {
            yield defaultValue;
        }
    }

    private async *distinct(): AsyncIterable<T> {
        const appeared =  new Set<T>();
        for await (const element of this.iterable) {
            if (!appeared.has(element)) {
                yield element;
                appeared.add(element);
            }
        }
    }

    private async elementAt(index: number): Promise<T | undefined> {
        let i = 0;
        for await (const element of this.iterable) {
            if (i === index) {
                return element;
            }
            i++;
        }
        return undefined;
    }

    private async *except(that: AsyncOrSyncIterable<T>): AsyncIterable<T> {
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

    private async first(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<T | undefined> {
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

    private async *groupBy<TKey, TElement = T, TResult = Grouping<TKey, TElement>>(
        keySelector: (element: T) => AsyncOrSync<TKey>,
        elementSelector?: (element: T) => AsyncOrSync<TElement>,
        resultSelector?: (key: TKey, results: Iterable<TElement>) => AsyncOrSync<TResult>
    ): AsyncIterable<TResult> {
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

    private async *groupJoin<TInner, TKey, TResult>(
        inner: AsyncOrSyncIterable<TInner>,
        outerKeySelector: (element: T) => AsyncOrSync<TKey>,
        innerKeySelector: (element: TInner) => AsyncOrSync<TKey>,
        resultSelector: (outerElement: T, innerElements: Iterable<TInner>) => AsyncOrSync<TResult>
    ): AsyncIterable<TResult> {
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

    private async *intersect(that: AsyncOrSyncIterable<T>): AsyncIterable<T> {
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

    private async *join<TInner, TKey, TResult>(
        inner: AsyncOrSyncIterable<TInner>,
        outerKeySelector: (element: T) => AsyncOrSync<TKey>,
        innerKeySelector: (element: TInner) => AsyncOrSync<TKey>,
        resultSelector: (outerElement: T, innerElement: TInner) => AsyncOrSync<TResult>
    ): AsyncIterable<TResult> {
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

    private async last(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<T | undefined> {
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

    private async max(DO_NOT_ASSIGN: T extends number ? void : never): Promise<number> {
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

    private async min(DO_NOT_ASSIGN: T extends number ? void : never): Promise<number> {
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

    private async *orderBy<TKey>(keySelector: (element: T) => TKey, comparer?: (lhs: TKey, rhs: TKey) => number): AsyncIterable<T> {
        let comparerWithKey: (lhs: T, rhs: T) => number;
        if (comparer) {
            comparerWithKey = (lhs: T, rhs: T) => comparer(keySelector(lhs), keySelector(rhs));
        } else {
            comparerWithKey = (lhs: T, rhs: T): number => {
                const lKey = keySelector(lhs);
                const rKey = keySelector(rhs);
                if (lKey === rKey) {
                    return 0;
                }
                return lKey < rKey ? -1 : 1;
            };
        }
        const sorted = (await this.toArray()).sort((lhs, rhs) => comparerWithKey(lhs, rhs));
        yield* sorted;
    }

    private async *orderByDescending<TKey>(keySelector: (element: T) => TKey, comparer?: (lhs: TKey, rhs: TKey) => number): AsyncIterable<T> {
        let comparerWithKey: (lhs: T, rhs: T) => number;
        if (comparer) {
            comparerWithKey = (lhs: T, rhs: T) => comparer(keySelector(lhs), keySelector(rhs));
        } else {
            comparerWithKey = (lhs: T, rhs: T): number => {
                const lKey = keySelector(lhs);
                const rKey = keySelector(rhs);
                if (lKey === rKey) {
                    return 0;
                }
                return lKey < rKey ? -1 : 1;
            };
        }
        const sorted = (await this.toArray()).sort((lhs, rhs) => comparerWithKey(rhs, lhs));
        yield* sorted;
    }

    private async *prepend(element: T): AsyncIterable<T> {
        yield element;
        yield* this.iterable;
    }

    private async *reverse(): AsyncIterable<T> {
        yield* (await this.toArray()).reverse();
    }

    private async *select<TResult>(selector: (element: T, index: number) => AsyncOrSync<TResult>): AsyncIterable<TResult> {
        let i = 0;
        for await (const element of this.iterable) {
            yield selector(element, i);
            i++;
        }
    }

    private async *selectMany<TResult>(selector: (element: T, index: number) => AsyncOrSyncIterable<TResult>): AsyncIterable<TResult> {
        let i = 0;
        for await (const element of this.iterable) {
            yield* selector(element, i);
            i++;
        }
    }

    private async sequenceEqual(that: AsyncOrSyncIterable<T>, comparer?: (lhs: T, rhs: T) => AsyncOrSync<boolean>): Promise<boolean> {
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

    private async single(predicate?: (element: T) => AsyncOrSync<boolean>): Promise<T> {
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

    private async *skip(count: number): AsyncIterable<T> {
        let i = 0;
        for await (const element of this.iterable) {
            if (i >= count) {
                yield element;
            }
            i++;
        }
    }

    private async *skipLast(count: number): AsyncIterable<T> {
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

    private async *skipWhile(predicate: (element: T, index: number) => AsyncOrSync<boolean>): AsyncIterable<T> {
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

    private async sum(DO_NOT_ASSIGN: T extends number ? void : never): Promise<number> {
        let sum = 0;
        for await (const element of this.iterable as any as AsyncIterable<number>) {
            sum += element;
        }
        return sum;
    }

    private async *take(count: number): AsyncIterable<T> {
        let i = 0;
        for await (const element of this.iterable) {
            if (i < count) {
                yield element;
            }
            i++;
        }
    }

    private async *takeLast(count: number): AsyncIterable<T> {
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

    private async *takeWhile(predicate: (element: T, index: number) => AsyncOrSync<boolean>): AsyncIterable<T> {
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

    private async toMap<TKey>(keySelector: (element: T) => AsyncOrSync<TKey>): Promise<Map<TKey, T>> {
        const result = new Map<TKey, T>();

        for await (const element of this.iterable) {
            result.set(await keySelector(element), element);
        }

        return result;
    }

    private async toSet(): Promise<Set<T>> {
        const result = new Set<T>();

        for await (const element of this.iterable) {
            result.add(element);
        }

        return result;
    }

    private async *union(that: AsyncOrSyncIterable<T>): AsyncIterable<T> {
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

    private async *where(predicate: (element: T) => AsyncOrSync<boolean>): AsyncIterable<T> {
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                yield element;
            }
        }
    }

    private async *zip<TThat, TResult = [T, TThat]>(that: AsyncOrSyncIterable<TThat>, resultSelector?: (first: T, second: TThat) => AsyncOrSync<TResult>): AsyncIterable<TResult> {
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
