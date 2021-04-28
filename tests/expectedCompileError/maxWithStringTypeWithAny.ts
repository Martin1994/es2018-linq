import { from } from "../../src";

// Max should not be callable with string iterable
from(["string", "iterable"]).max(1 as any);
