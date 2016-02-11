# RethinkDB filter parser

This is pretty experimental, and mostly for my own edification.  It turns simple lambdas into ReQL, for no good reason, other than to give a sort of C# style interface.  Half the things you should be able to do aren't implemented yet.  Also, it converts the function to a string then parses it, so it'll bork on a wide variety of otherwise reasonable-looking functions.


## Installation

    $ npm install --save rethink-filter-parser

## Usage

Import and use.

```js
import parser from 'rethink-filter-parser';

// ...

r.table('people').filter(parser((x) => x.age > 18))
// equivalent to r.table('people').filter(r.row('age').gt(18))
```

Note that the choice of the name `x` to stand for the row is arbitrary: it could be called something else, as long as there is exactly one argument.

The 'preferred' way is to use [rethink-plus](https://www.npmjs.com/package/rethink-plus):

```js
import parser from 'rethink-filter-parser';
import RethinkPlus from 'rethink-plus';

let db = new RethinkPlus({plugins: [parser.plugin]});
let adults = await db.table.people.filter((x) => x.age > 16);
```

You can add context to use within your lambda - the 2nd argument can be referred to by `ctx`:

```js
let people = await db.table.people.filter((x) => x.age > ctx, minAge);
```

If you pass an object, the fields are accessible just by name:

```js
let people = await db.table.people.filter((x) => x.age > minAge, {minAge});
```

Note that the lambda is parsed, not run, and so it can't 'see' other variables in the scope: hence the context parameter.

Finally, if you're stuck without lambdas, you can use a good old-fashioned function, as long as it only has one statement and it begins with `return`:

```js
db.table.people.filter(function (x) { return x.age > minAge; }, {minAge})
```

That sort of defeats the point though...

## Licence etc

ISC licence, do what you like.  It's pretty much only half-written, so if you're interested in this project get in touch and I'll make an effort to finish it!
