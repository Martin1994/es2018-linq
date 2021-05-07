import { from } from "../../src";

// Zip should be either without TResult or with a result selector
from([""]).groupBy<string, string>(x => x);
