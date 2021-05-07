import { from } from "../../src";

// Zip should be either without TResult or with a result selector
from([0]).zip<string, boolean>(["1"]);
