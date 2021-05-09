# ESLINQ - LINQ for ES2018

## Abstract

This library provides a set of functional programming APIs with deferred execution, migrated from [LINQ](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/) from the .NET world. These predefined functional programming APIs allows you to manipulate an [Iterable<T>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) (available since ES2015) or an [AsyncIterable<T>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator) (available since ES2018) efficiently in an easy and maintainable shape.

This library attempts to provide exact the same API defined in [Enumerable](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable) of .NET with TypeScript types. On top of that, it attempts to provide consistent API experience between synchronous and asynchronous operations by leveraging TypeScript code generation.

There are still a few missing or slightly different APIs from this port comparing to the original .NET implementation. Please refer to [Difference from .NET implementation](#difference-from-net-implementation) section for details. That is either because some nature difference between JavaScript and .NET (such as lack of `default(T)`), or to avoid complicated method overloading. If you find missing methods or overloading signatures which do not land into any of those reasons, they will be supported in a future version of this library some day.

## Usage

Since this library is a ES2018 port of LINQ from .NET, please refer to [System.Linq.Enumerable API documentation](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable) as a detailed API reference.

### Start using LINQ

```javascript
import { from } from "es2018-linq";

console.log(
    from([-1, 0, 1, 2])
        .where(x => x > 0)
        .select(x => x * 2)
        .toArray()
);

// Output: [2, 4]
```

### Create an Enumerable from an Iterable

```javascript
const myIterable = ["some", "value"];
const enumerable = from(myIterable);
```

### Create an AsyncEnumerable from an AsyncIterable

```javascript
const myIterable = ["some", "value"];
const enumerable = from(myIterable);
```

### Convert an Enumerable (synchronous) to an AsyncEnumerable

```javascript
const enumerable = from(["John", "Smith"]);
const asyncEnumerable = enumerable.asAsync();

// Then it accepts asynchronous functions
const allPresent = await asyncEnumerable.all(async x => await queryPresentAsync(x));
```

### Iterate with an Enumerable

```javascript
const myInput = [0, 1, 2, 3];
const enumerable = from(myInput).where(x => x % 2 === 0);

for (const x of enumerable) {
    console.log(x);
}
// Output:
//     0
//     2

console.log(enumerable.toArray());
// Output:
//     [0, 2]
```

### Executions are deferred as much as possible
```javascript
function* generator() {
    yield 0;
    yield 1;
    throw new Error();
}

// Execution will stop when no further element is needed
const hasOne = from(generator()).any(x => x === 1); // Will return. Won't throw
const hasTwo = from(generator()).any(x => x === 2); // Won't return. Will throw

// However some operations such as distinct() cannot defer any execution
// because they require the information of all elements
const hasOneFromDistinctElements = from(generator()).distinct().any(); // Won't return. Will throw
```

### Work with an asynchronous iterable

```javascript
async function* asyncGenerator() {
    yield* [0, 1, 2, 3];
}
const asyncEnumerable = from(asyncGenerator());

// It accepts both synchronous and asynchronous functions
console.log(await asyncEnumerable.any(x => x === 2)); // Output: true
console.log(await asyncEnumerable.any(x => Promise.resolve(x === 2))); // Output: true
```

### Static type check for specialized methods

```typescript
// Calling sum on a number iterable without any issue
from([0, 1, 2]).sum();

// However cannot call sum on a string iterable
from(["string", "iterable"]).sum(); // Type error. Won't compile.
```

## Development guide

### Get started

```shell
# Compile
npm run build

# Test
npm test
```

### File structure

- `codegen` directory contains the source code for code generation.
- `template` directory contains the template code for code generation.
    - `asyncEnumerable.ts` and `enumerable.ts` are the empty template classes. Their content will be copied as is.
    - `implementationTemplate.ts` contains implementation methods. Each of the implementation method will be added into the above two classes. Contents other than the implementation methods is not used in code generation.
- `src` directory contains source code, including both generated and non-generated ones.
- `lib` directory contains compiled code, type definitions and source maps.
- `tests` directory contains unit tests.

### How code generation works

The goal of code generation here is to generate both synchronous and asynchronous implementation methods from one single source.

The strategy here is to write code template with valid TypeScript, and then use TypeScript compiler API to stitch implementation methods into the two output classes with necessary modification. This stitching operation is done at AST level.

For example, a template implementation method, its generated asynchronous method and generated synchronous method will look like the following:

```typescript
// Template implementation template class
class EnumerableImplementationTemplate<T> {
    public async *where(predicate: (element: T) => AsyncOrSync<boolean>): WrapWithAsyncEnumerable<T> {
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                yield element;
            }
        }
    }
}

// Generated asynchronous class
class AsyncEnumerable<T> {
    // A wrapper method will be generated
    public where(predicate: (element: T) => AsyncOrSync<boolean>): AsyncEnumerable<T> {
        return new AsyncEnumerable(this.whereImpl(predicate));
    }

    // The template method will have a prefix "Impl" in its name
    private async *whereImpl(predicate: (element: T) => AsyncOrSync<boolean>): AsyncIterable<T> {
        // Method body will be kept as is
        for await (const element of this.iterable) {
            if (await predicate(element)) {
                yield element;
            }
        }
    }
}

// Generated synchronous class
class Enumerable<T> {
    // A wrapper method will be generated
    // Asynchronous types will be removed from its signature or turned into its synchronous alternative
    public where(predicate: (element: T) => boolean): Enumerable<T> {
        return new Enumerable(this.whereImpl(predicate));
    }

    // The template method will have a prefix "Impl" in its name
    // Asynchronous types will be removed from its signature or turned into its synchronous alternative
    private *whereImpl(predicate: (element: T) => boolean): Iterable<T> {
        // Method body will *almost* be kept as is, except await keywords will be removed.
        for (const element of this.iterable) {
            if (predicate(element)) {
                yield element;
            }
        }
    }
}
```

## Difference from .NET implementation

Missing methods due to lack of feature in JavaScript runtime:
```csharp
Cast<TResult>(IEnumerable) // No runtime cast in JavaScript

LongCount<TSource>(IEnumerable<TSource>) // No long in TypeScript
LongCount<TSource>(IEnumerable<TSource>, Func<TSource,Boolean>) // No long in TypeScript
```

Missing methods to be added later:
```csharp
ToLookup<TSource,TKey,TElement>(IEnumerable<TSource>, Func<TSource,TKey>, Func<TSource,TElement>) // Will add later
ToLookup<TSource,TKey>(IEnumerable<TSource>, Func<TSource,TKey>) // Will add later
```

Missing overloads due to lack of feature in JavaScript runtime:
```csharp
Aggregate<TSource>(IEnumerable<TSource>, Func<TSource,TSource,TSource>) // No `default(T)` in TypeScript

Distinct<TSource>(IEnumerable<TSource>, IEqualityComparer<TSource>) // JavaScript Set does not support comparers

Except<TSource>(IEnumerable<TSource>, IEnumerable<TSource>, IEqualityComparer<TSource>) // JavaScript Set does not support comparers

GroupBy<TSource,TKey,TElement,TResult>(IEnumerable<TSource>, Func<TSource,TKey>, Func<TSource,TElement>, Func<TKey,IEnumerable<TElement>,TResult>, IEqualityComparer<TKey>) // JavaScript Map does not support comparers
GroupBy<TSource,TKey,TElement>(IEnumerable<TSource>, Func<TSource,TKey>, Func<TSource,TElement>, IEqualityComparer<TKey>) // JavaScript Map does not support comparers
GroupBy<TSource,TKey,TResult>(IEnumerable<TSource>, Func<TSource,TKey>, Func<TKey,IEnumerable<TSource>,TResult>, IEqualityComparer<TKey>)  // JavaScript Map does not support comparers
GroupBy<TSource,TKey>(IEnumerable<TSource>, Func<TSource,TKey>, IEqualityComparer<TKey>) // JavaScript Map does not support comparers

GroupJoin<TOuter,TInner,TKey,TResult>(IEnumerable<TOuter>, IEnumerable<TInner>, Func<TOuter,TKey>, Func<TInner,TKey>, Func<TOuter,IEnumerable<TInner>,TResult>, IEqualityComparer<TKey>)  // JavaScript Map does not support comparers

Intersect<TSource>(IEnumerable<TSource>, IEnumerable<TSource>, IEqualityComparer<TSource>) // JavaScript Set does not support comparers

Join<TOuter,TInner,TKey,TResult>(IEnumerable<TOuter>, IEnumerable<TInner>, Func<TOuter,TKey>, Func<TInner,TKey>, Func<TOuter,TInner,TResult>, IEqualityComparer<TKey>)  // JavaScript Set does not support comparers

Max<TSource>(IEnumerable<TSource>) // No IComparable in JavaScript

Min<TSource>(IEnumerable<TSource>) // No IComparable in JavaScript

OfType<TResult>(IEnumerable) // No generic type check method in JavaScript

ToDictionary<TSource,TKey,TElement>(IEnumerable<TSource>, Func<TSource,TKey>, Func<TSource,TElement>, IEqualityComparer<TKey>) // JavaScript Map does not support comparers
ToDictionary<TSource,TKey>(IEnumerable<TSource>, Func<TSource,TKey>, IEqualityComparer<TKey>) // JavaScript Map does not support comparers

ToHashSet<TSource>(IEnumerable<TSource>, IEqualityComparer<TSource>) // JavaScript Set does not support comparers

ToList<TSource>(IEnumerable<TSource>) // Duplicate with ToArray in context of JavaScript

ToLookup<TSource,TKey,TElement>(IEnumerable<TSource>, Func<TSource,TKey>, Func<TSource,TElement>, IEqualityComparer<TKey>) // JavaScript Map does not support comparers
ToLookup<TSource,TKey>(IEnumerable<TSource>, Func<TSource,TKey>, IEqualityComparer<TKey>) // JavaScript Map does not support comparers

Union<TSource>(IEnumerable<TSource>, IEnumerable<TSource>, IEqualityComparer<TSource>) // JavaScript Set does not support comparers
```

Missing overloads whose overload signature is too complicated to implement in JavaScript with other overloads:
```csharp
Aggregate<TSource,TAccumulate,TResult>(IEnumerable<TSource>, TAccumulate, Func<TAccumulate,TSource,TAccumulate>, Func<TAccumulate,TResult>)

Average<TSource>(IEnumerable<TSource>, Func<TSource,TNumber>)

GroupBy<TSource,TKey,TResult>(IEnumerable<TSource>, Func<TSource,TKey>, Func<TKey,IEnumerable<TSource>,TResult>)

Max<TSource>(IEnumerable<TSource>, Func<TSource,TNumber>)

Min<TSource>(IEnumerable<TSource>, Func<TSource,TNumber>)

Sum<TSource>(IEnumerable<TSource>, Func<TSource,TNumber>)

```


Methods and overloads who returns `undefined` instead of `default(T)`
```csharp
DefaultIfEmpty<TSource>(IEnumerable<TSource>) // Use undefinedIfEmpty instead

ElementAtOrDefault<TSource>(IEnumerable<TSource>, Int32) // Use ElementAtOrUndefined instead

FirstOrDefault<TSource>(IEnumerable<TSource>) // Use FirstOrUndefined instead
FirstOrDefault<TSource>(IEnumerable<TSource>, Func<TSource,Boolean>) // Use FirstOrUndefined instead

LastOrDefault<TSource>(IEnumerable<TSource>) // Use LastOrUndefined instead
LastOrDefault<TSource>(IEnumerable<TSource>, Func<TSource,Boolean>) // Use LastOrUndefined instead

SingleOrDefault<TSource>(IEnumerable<TSource>, Func<TSource,Boolean>) // Use SingleOrUndefined instead
```

Renamed methods:
```csharp
ToDictionary<TSource,TKey,TElement>(IEnumerable<TSource>, Func<TSource,TKey>, Func<TSource,TElement>) // Use toMap instead
ToDictionary<TSource,TKey>(IEnumerable<TSource>, Func<TSource,TKey>) // Use toMap instead

ToHashSet<TSource>(IEnumerable<TSource>) // Use toSet instead
```

## Prior art
* https://github.com/balazsbotond/eslinq
