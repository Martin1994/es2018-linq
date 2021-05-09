import { from } from "../../src";

// Max should not be callable with string iterable
from([0]).max(1);
