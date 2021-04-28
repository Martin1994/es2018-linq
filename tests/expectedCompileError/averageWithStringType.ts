import { from } from "../../src";

// Max should not be callable with string iterable
from(["string", "iterable"]).average();
