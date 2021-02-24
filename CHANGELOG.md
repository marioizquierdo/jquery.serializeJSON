Changelog
---------

 * *3.2.1* (Feb 24, 2021): Fix sync issue between Github tag and npm.
 * *3.2.0* (Feb 24, 2021): Reimplement jQuery's serializeArray function, with the ability to include unchecked checkboxes, and returning the DOM element. This allows to simplify the code, fixing an issue with repeated input names used for arrays (Fixes #67), and allows custom type functions to receive the DOM elemnt (Fixes #109).
 * *3.1.1* (Dec 30, 2020): Update #114 (Allow to use new versions of jQuery by avoiding calls to the deprecated method `jQuery.isArray`).
 * *3.1.1* (Nov 09, 2020): Bugfix #110 (Allow unindexed arrays with multiple levels of nested objects).
 * *3.1.0* (Sep 13, 2020): Rename option `disableColonTypes` that was mistakenly named `disableSemicolonTypes`. Fix typos in README.
 * *3.0.0* (Sep 06, 2020): Improve types (PR #105) and remove parsing options (PR #104). The type system with `:type` suffixes, `data-value-type` attributes, and a combination of the options `customTypes`, `disableColonTypes` and `defaultType`, are safer and easier to use than the previous options `parseNumbers`, `parseAll`, etc. Thanks [Laykou](https://github.com/Laykou) for suggesting [PR #102] that pointed the problems of inputs with colons in their names.
 * *2.9.0* (Jan 12, 2018): Overrides to `customTypes.string` function now also apply to fields with no type, because `:string` is the default implicit type. Thanks [JocaPC](https://github.com/JocaPC) for reporting the [issue #83](https://github.com/marioizquierdo/jquery.serializeJSON/issues/83).
 * *2.8.1* (Dec 09, 2016): Identify issue #67 and throw a descriptive error with a link to the issue, that explains why nested arrays of objects with checkboxes with unchecked values are not supported.
 * *2.8.0* (Dec 09, 2016): Add options `skipFalsyValuesForFields`, `skipFalsyValuesForTypes` and attr `data-skip-falsy` to easily skip falsy values (which includes empty strings). Thanks to [milkaknap](https://github.com/milkaknap).
 * *2.7.2* (Dec 19, 2015): Bugfix #55 (Allow data types with the `data-value-type` attribute to use brackets in names). Thanks to [stricte](https://github.com/stricte).
 * *2.7.1* (Dec 12, 2015): Bugfix #54 (`data-value-type` attribute only works with input elements). Thanks to [madrabaz](https://github.com/madrabaz).
 * *2.7.0* (Nov 28, 2015): Allow to define custom types with the `data-value-type` attribute. Thanks to [madrabaz](https://github.com/madrabaz).
 * *2.6.2* (Oct 24, 2015): Add support for AMD/CommonJS/Browserify modules. Thanks to [jisaacks](https://github.com/jisaacks).
 * *2.6.1* (May 13, 2015): Bugfix #43 (Fix IE 8 compatibility). Thanks to [rywall](https://github.com/rywall).
 * *2.6.0* (Apr 24, 2015): Allow to define custom types with the option `customTypes` and inspect/override default types with the option `defaultTypes`. Thanks to [tygriffin](https://github.com/tygriffin) for the [pull request](https://github.com/marioizquierdo/jquery.serializeJSON/pull/40).
 * *2.5.0* (Mar 11, 2015): Override serialized properties if using the same name, even for nested values, instead of crashing the script, fixing issue#29. Also fix a crash when using Zepto and the data-unchecked-value option.
 * *2.4.2* (Feb 04, 2015): Ignore disabled checkboxes with "data-unchecked-value". Thanks to [skarr](https://github.com/skarr) for the [pull request](https://github.com/marioizquierdo/jquery.serializeJSON/pull/33).
 * *2.4.1* (Oct 12, 2014): Add `:auto` type, that works like the `parseAll` option, but targeted to a single input.
 * *2.4.0* (Oct 12, 2014): Implement :types. Types allow to easily specify how to parse each input.
 * *2.3.2* (Oct 11, 2014): Bugfix #27 (parsing error on nested keys like name="foo[inn[bar]]"). Thanks to [danlo](https://github.com/danlo) for finding the issue.
 * *2.3.1* (Oct 06, 2014): Bugfix #22 (ignore checkboxes with no name when doing `checkboxUncheckedValue`). Thanks to [KATT](https://github.com/KATT) for finding and fixing the issue.
 * *2.3.0* (Sep 25, 2014): Properly spell "data-unckecked-value", change for "data-unchecked-value"
 * *2.2.0* (Sep 17, 2014): Add option `checkboxUncheckedValue` and attribute `data-unckecked-value` to allow parsing unchecked checkboxes.
 * *2.1.0* (Jun 08, 2014): Add option `parseWithFunction` to allow custom parsers. And fix issue #14: empty strings were parsed as a zero when `parseNumbers` option was true.
 * *2.0.0* (May 04, 2014): Nested keys are always object attributes by default (discussed on issue #12). Set option `$.serializeJSON.defaultOptions.useIntKeysAsArrayIndex = true;` for backwards compatibility (see **Options** section). Thanks to [joshuajabbour](https://github.com/joshuajabbour) for finding the issue.
 * *1.3.0* (May 03, 2014): Accept options {parseBooleans, parseNumbers, parseNulls, parseAll} to modify what type to values are interpreted from the strings. Thanks to [diaswrd](https://github.com/diaswrd) for finding the issue.
 * *1.2.3* (Apr 12, 2014): Lowercase filenames.
 * *1.2.2* (Apr 03, 2014): Now also works with [Zepto.js](http://zeptojs.com/).
 * *1.2.1* (Mar 17, 2014): Refactor, cleanup, lint code and improve test coverage.
 * *1.2.0* (Mar 11, 2014): Arrays with empty index and objects with empty values are added and not overriden. Thanks to [kotas](https://github.com/kotas).
 * *1.1.1* (Feb 16, 2014): Only unsigned integers are used to create arrays. Alphanumeric keys are always for objects. Thanks to [Nicocin](https://github.com/Nicocin).
 * *1.0.2* (Jan 07, 2014): Tag to be on the jQuery plugin registry.
 * *1.0.1* (Aug 20, 2012): Bugfix: ensure that generated arrays are being displayed when parsed with JSON.stringify
 * *1.0.0* (Aug 20, 2012): Initial release
