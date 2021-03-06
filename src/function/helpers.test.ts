import * as test from "tape";
import bimap from "./bimap";
import chain from "./chain";
import constant from "./constant";
import compose from "./compose";
import curry from "./curry";
import Either from "../adt/Either";
import fmap from "./fmap";
import id from "./id";
import isFunction from "./isFunction";
import liftAn from "./liftAn";
import liftA2 from "./liftA2";
import liftA3 from "./liftA3";
import ocurry from "./ocurry";
import once from "./once";

test("Helpers", t => {
    const val = "hello";
    const unwrap = (m: { getValue: Function }) => m.getValue();
    const add = (a: number, b: number, c: number) => a + b + c;
    const curriedAdd = curry(add);
    const nadd = (arg: { a: number; b: number; c: number }) =>
        arg.a + arg.b + arg.c;
    const ncurriedAdd = ocurry(nadd, ["a", "b", "c"]);
    const add2 = (a: number) => a + 2;
    const eAdd2 = (a: number) => Either.of(a + 2);
    const sub1 = (a: number) => a - 1;
    const singleAdd2 = once(add2);
    const e1 = Either.of(1);

    t.equals(id(val), val, "id returns what is passed");

    t.throws(once.bind(null, 1), "once expects a function");
    t.ok(isFunction(singleAdd2), "once returns a function");
    t.equals(singleAdd2(singleAdd2(2)), 4, "once runs once");

    t.deepEqual(
        fmap((a: number) => a + 1, [1, 2, 3]),
        [2, 3, 4],
        "fmap"
    );
    t.throws(
        fmap.bind(null, () => 2, 1),
        "fmap throws an error if a functor is not provided"
    );
    t.throws(
        fmap.bind(null, 1, [1]),
        "fmap throws an error if a function is not provided"
    );

    t.equals(unwrap(bimap(add2, sub1, e1)), 0, "bimap");
    t.throws(
        bimap.bind(null, null, null, e1),
        "bimap throws an error if functions are not provided"
    );
    t.throws(
        bimap.bind(null, add2, sub1, 1),
        "bimap throws an error if a bifunctor is not provided"
    );

    t.equals(unwrap(chain(eAdd2, e1)), 3, "chain");
    t.throws(
        chain.bind(null, () => 2, 1),
        "chain throws an error if a Monad is not provided"
    );
    t.throws(
        chain.bind(null, 1, e1),
        "chain throws an error if a function is not provided"
    );

    const kfn = constant(val);
    t.ok(isFunction(kfn), "constant returns a function");
    t.equals(kfn(), val, "constant returns a function that returns a value");

    t.ok(isFunction(curry(() => 2)), "curry should return a function");
    t.throws(curry.bind(null), "curry throws an error if nothing is provided");
    t.throws(
        curry.bind(null, 1),
        "curry throws an error if a valid function is not provided"
    );
    t.equals(
        curriedAdd(1)(2)(3),
        add(1, 2, 3),
        "curry return the same value as the original uncurried function"
    );
    t.ok(
        isFunction(curriedAdd(1, 2)),
        "curry return a function when arguments count is less than the original number of arguments"
    );

    t.ok(isFunction(ncurriedAdd), "named curry should return a function");
    t.throws(
        ocurry.bind(null),
        "named curry throws an error if nothing is provided"
    );
    t.throws(
        ocurry.bind(null, 1),
        "named curry throws an error if a valid function is not provided"
    );
    t.throws(
        ocurry.bind(null, (a, b) => a + b, 1),
        "named curry throws an error if function airty less than 1"
    );
    t.equals(
        ncurriedAdd({ a: 1 })({ b: 2 })({ c: 3 }),
        nadd({ a: 1, b: 2, c: 3 }),
        "named curry returns the same value as the original uncurried function"
    );
    t.ok(
        isFunction(ncurriedAdd({ a: 1 })),
        "named curry return a function when arguments count is less than the original number of arguments"
    );

    t.ok(isFunction(compose(add2, sub1)), "compose returns a function");
    t.throws(
        compose.bind(null),
        "compose throws an error if there is no function passed"
    );
    t.equals(
        compose(add2)(1),
        add2(1),
        "compose returns the same value as the function call if only a single function is composed"
    );
    t.equals(
        compose(add2, sub1)(1),
        2,
        "compose return the same result as calling the functions individually"
    );

    t.throws(() => liftAn(1, [e1]), "liftAn expects a function");
    t.throws(() => liftAn(add2, []), "liftAn expects a Array of Apply");
    t.equals(unwrap(liftAn(add2, [e1])), 3, "liftAn");
    t.equals(
        unwrap(liftAn(x1 => x2 => x3 => x1 + x2 + x3, [e1, e1, e1])),
        3,
        "liftAn 3"
    );
    t.equals(unwrap(liftA2(a => b => a + b, e1, Either.Right(1))), 2, "liftA2");
    t.equals(
        unwrap(
            liftA3(
                a => b => c => a + b + c,
                e1,
                Either.Right(1),
                Either.Right(1)
            )
        ),
        3,
        "liftA3"
    );

    t.end();
});
