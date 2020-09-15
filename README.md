jquery.serializeJSON
====================

Adds the method `.serializeJSON()` to [jQuery](http://jquery.com/) (or [Zepto](http://zeptojs.com/)) that serializes a form into a JavaScript Object, using the same format as the default Ruby on Rails request params.

Install
-------

Install with [bower](http://bower.io/) `bower install jquery.serializeJSON`, or [npm](https://www.npmjs.com/) `npm install jquery-serializejson`, or just download the [jquery.serializejson.js](https://raw.githubusercontent.com/marioizquierdo/jquery.serializeJSON/master/jquery.serializejson.js) script.

And make sure it is included after jQuery, for example:
```html
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="jquery.serializejson.js"></script>
```

Usage Example
-------------

HTML form:
```html
<form>
  <input type="text" name="title" value="Finding Loot"/>
  <input type="text" name="author[name]" value="John Smith"/>
  <input type="text" name="author[job]"  value="Legendary Pirate"/>
</form>
```

JavaScript:
```javascript
$('form').serializeJSON();

// returns =>
{
  title: "Finding Loot",
  author: {
    name: "John Smith",
    job: "Legendary Pirate"
  }
}
```

Form input, textarea and select tags are supported. Nested attributes and arrays can be specified by using the `attr[nested][nested]` syntax.

HTML form:
```html
<form id="my-profile">
  <!-- simple attribute -->
  <input type="text" name="fullName"              value="Mario Izquierdo" />

  <!-- nested attributes -->
  <input type="text" name="address[city]"         value="San Francisco" />
  <input type="text" name="address[state][name]"  value="California" />
  <input type="text" name="address[state][abbr]"  value="CA" />

  <!-- array -->
  <input type="text" name="jobbies[]"             value="code" />
  <input type="text" name="jobbies[]"             value="climbing" />

  <!-- nested arrays, textareas, checkboxes ... -->
  <textarea              name="projects[0][name]">serializeJSON</textarea>
  <textarea              name="projects[0][language]">javascript</textarea>
  <input type="hidden"   name="projects[0][popular]" value="0" />
  <input type="checkbox" name="projects[0][popular]" value="1" checked />

  <textarea              name="projects[1][name]">tinytest.js</textarea>
  <textarea              name="projects[1][language]">javascript</textarea>
  <input type="hidden"   name="projects[1][popular]" value="0" />
  <input type="checkbox" name="projects[1][popular]" value="1"/>

  <!-- select -->
  <select name="selectOne">
    <option value="paper">Paper</option>
    <option value="rock" selected>Rock</option>
    <option value="scissors">Scissors</option>
  </select>

  <!-- select multiple options, just name it as an array[] -->
  <select multiple name="selectMultiple[]">
    <option value="red"  selected>Red</option>
    <option value="blue" selected>Blue</option>
    <option value="yellow">Yellow</option>
	</select>
</form>

```

JavaScript:

```javascript
$('#my-profile').serializeJSON();

// returns =>
{
  fullName: "Mario Izquierdo",

  address: {
    city: "San Francisco",
    state: {
      name: "California",
      abbr: "CA"
    }
  },

  jobbies: ["code", "climbing"],

  projects: {
    '0': { name: "serializeJSON", language: "javascript", popular: "1" },
    '1': { name: "tinytest.js",   language: "javascript", popular: "0" }
  },

  selectOne: "rock",
  selectMultiple: ["red", "blue"]
}
```

The `serializeJSON` function returns a JavaScript object, not a JSON String. The plugin should probably have been called `serializeObject` or similar, but those plugins already existed.

To convert into a JSON String, use the `JSON.stringify` method, that is available on all major [new browsers](http://caniuse.com/json).
If you need to support very old browsers, just include the [json2.js](https://github.com/douglascrockford/JSON-js) polyfill (as described on [stackoverfow](http://stackoverflow.com/questions/191881/serializing-to-json-in-jquery)).

```javascript
var obj = $('form').serializeJSON();
var jsonString = JSON.stringify(obj);
```

The plugin implememtation relies on jQuery's [.serializeArray()](https://api.jquery.com/serializeArray/) method.
This means that it only serializes the inputs supported by `.serializeArray()`, which follows the standard W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2). In particular, the included elements **cannot be disabled** and must contain a **name attribute**. No submit button value is serialized since the form was not submitted using a button. And data from file select elements is not serialized.


Parse values with :types
------------------------

Fields values are **string** by default. But can be parsed with types by appending the `:type` suffix to the field name:

```html
<form>
  <input type="text" name="default"          value=":string is default"/>
  <input type="text" name="text:string"      value="some text string"/>
  <input type="text" name="excluded:skip"    value="ignored field because of type :skip"/>

  <input type="text" name="numbers[1]:number"        value="1"/>
  <input type="text" name="numbers[1.1]:number"      value="1.1"/>
  <input type="text" name="numbers[other]:number"    value="other"/>

  <input type="text" name="bools[true]:boolean"      value="true"/>
  <input type="text" name="bools[false]:boolean"     value="false"/>
  <input type="text" name="bools[0]:boolean"         value="0"/>

  <input type="text" name="nulls[null]:null"         value="null"/>
  <input type="text" name="nulls[other]:null"        value="other"/>

  <input type="text" name="arrays[empty]:array"         value="[]"/>
  <input type="text" name="arrays[list]:array"          value="[1, 2, 3]"/>

  <input type="text" name="objects[empty]:object"       value="{}"/>
  <input type="text" name="objects[dict]:object"        value='{"my": "stuff"}'/>
</form>
```

```javascript
$('form').serializeJSON();

// returns =>
{
  "default": ":string is the default",
  "text": "some text string",
  // excluded:skip is ignored in the output

  "numbers": {
    "1": 1,
    "1.1": 1.1,
    "other": NaN, // <-- "other" is parsed as NaN
  },
  "bools": {
    "true": true,
    "false": false,
    "0": false, // <-- "false", "null", "undefined", "", "0" are parsed as false
  },
  "nulls": {
    "null": null, // <-- "false", "null", "undefined", "", "0"  are parsed as null
    "other": "other" // <-- if not null, the type is a string
  },
  "arrays": { // <-- uses JSON.parse
    "empty": [],
    "not empty": [1,2,3]
  },
  "objects": { // <-- uses JSON.parse
    "empty": {},
    "not empty": {"my": "stuff"}
  }
}
```

Types can also be specified with the attribute `data-value-type`, instead of adding the `:type` suffix in the field name:

```html
<form>
  <input type="text" name="anumb"   data-value-type="number"  value="1"/>
  <input type="text" name="abool"   data-value-type="boolean" value="true"/>
  <input type="text" name="anull"   data-value-type="null"    value="null"/>
  <input type="text" name="anarray" data-value-type="array"   value="[1, 2, 3]"/>
</form>
```

If your field names contain colons (e.g. `name="article[my::key][active]"`) the last part after the colon will be confused as an invalid type. One way to avoid that is to explicitly append the type `:string` (e.g. `name="article[my::key][active]:string"`), or to use the attribute `data-value-type="string"`. Data attributes have precedence over `:type` name suffixes. It is also possible to disable parsing `:type` suffixes with the option `{disableColonTypes: true}`.


### Custom Types

You can define your own types or override the defaults with the `customTypes` option. For example:

```html
<form>
  <input type="text" name="scary:alwaysBoo" value="not boo"/>
  <input type="text" name="str:string"      value="str"/>
  <input type="text" name="five:number"     value="5"/>
</form>
```

```javascript
$('form').serializeJSON({
  customTypes: {
    alwaysBoo: function(str) {
      return "boo";
    },
    string: function(str) {
      return str + "-override";
    },
    number: function(str) {
      return Number(str);
    }
  }
});

// returns =>
{
  "scary": "boo",        // <-- parsed with "alwaysBoo" function type
  "str": "str-override", // <-- parsed with "string" function override (instead of the default)
  "five": 5,             // <-- parsed with "number" function, one of the default types
}
```

The default types are defined in `$.serializeJSON.defaultOptions.defaultTypes`. If you want to define your own set of types, you could also re-define that option (it will not override the types, but define a new set of types).


Options
-------

With no options, `.serializeJSON()` returns the same as a regular HTML form submission when serialized as Rack/Rails params. In particular:

  * Values are **strings** (unless appending a `:type` to the input name)
  * Unchecked checkboxes are ignored (as defined in the W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2)).
  * Disabled elements are ignored (W3C rules)
  * Keys (input names) are always **strings** (nested params are objects by default)

Available options:

  * **checkboxUncheckedValue: string**, string value used on unchecked checkboxes (otherwise those values are ignored). For example `{checkboxUncheckedValue: ""}`. If the value needs to be parsed (i.e. to a Boolean or Null) use a parse option (i.e. `parseBooleans: true`) or define the input with the `:boolean` or `:null` types.
  * **useIntKeysAsArrayIndex: true**, when using integers as keys (i.e. `<input name="foods[0]" value="banana">`), serialize as an array (`{"foods": ["banana"]}`) instead of an object (`{"foods": {"0": "banana"}`).
  * **skipFalsyValuesForFields: []**, skip given fields (by name) with falsy values. You can use `data-skip-falsy="true"` input attribute as well. Falsy values are determined after converting to a given type, note that `"0"` as `:string` (default) is still truthy, but `0` as `:number` is falsy.
  * **skipFalsyValuesForTypes: []**, skip given fields (by :type) with falsy values (i.e. `skipFalsyValuesForTypes: ["string", "number"]` would skip `""` for `:string` fields, and `0` for `:number` fields).
  * **customTypes: {}**, define your own `:type` functions. Defined as an object like `{ type: function(value){...} }`. For example: `{customTypes: {nullable: function(str){ return str || null; }}`. Custom types extend the **defaultTypes**.
  * **defaultType: "string"**, fields that have no `:type` suffix and no `data-value-type` attribute are parsed with the `string` type function by default. This can be changed to use a different type like "number", or even a custom type function if defined in `customTypes`.
  * **disableColonTypes: true**, do not parse input names as types, allowing field names to use colons. If this option is used, types can still be specified with the `data-value-type` attribute. For example `<input name="foo::bar" value="1" data-value-type="number">` will be parsed as a number.

More details about these options in the sections below.

## Include unchecked checkboxes

One of the most confusing details when serializing a form is the input type checkbox, because it includes the value if checked, but nothing if unchecked.

To deal with this, a common practice in HTML forms is to use hidden fields for the "unchecked" values:

```html
<!-- Only one booleanAttr will be serialized, being "true" or "false" depending if the checkbox is selected or not -->
<input type="hidden"   name="booleanAttr" value="false" />
<input type="checkbox" name="booleanAttr" value="true" />
```

This solution is somehow verbose, but ensures progressive enhancement, it works even when JavaScript is disabled.

But, to make things easier, `serializeJSON` includes the option `checkboxUncheckedValue` and the possibility to add the attribute `data-unchecked-value` to the checkboxes:

```html
<form>
  <input type="checkbox" name="check1" value="true" checked/>
  <input type="checkbox" name="check2" value="true"/>
  <input type="checkbox" name="check3" value="true"/>
</form>
```

Serializes like this by default:

```javascript
$('form').serializeJSON();

// returns =>
{check1: 'true'} // check2 and check3 are ignored
```

To include all checkboxes, use the `checkboxUncheckedValue` option:

```javascript
$('form').serializeJSON({checkboxUncheckedValue: "false"});

// returns =>
{check1: "true", check2: "false", check3: "false"}
```

The `data-unchecked-value` HTML attribute can be used instead:

```html
<form id="checkboxes">
  <input type="checkbox" name="checked[bool]"  value="true" data-unchecked-value="false" checked/>
  <input type="checkbox" name="checked[bin]"   value="1"    data-unchecked-value="0"     checked/>
  <input type="checkbox" name="checked[cool]"  value="YUP"                               checked/>

  <input type="checkbox" name="unchecked[bool]"  value="true" data-unchecked-value="false" />
  <input type="checkbox" name="unchecked[bin]"   value="1"    data-unchecked-value="0" />
  <input type="checkbox" name="unchecked[cool]"  value="YUP" /> <!-- No unchecked value specified -->
</form>
```

Serializes including unchecked values. No option is needed in this case:

```javascript
$('form#checkboxes').serializeJSON(); // Note no option is used

// returns =>
{
  'checked': {
    'bool':  'true',
    'bin':   '1',
    'cool':  'YUP'
  },
  'unchecked': {
    'bool': 'false',
    'bin':  '0'
    // Note that unchecked cool does not appear, because it doesn't use data-unchecked-value
  }
}
```

You can use both the option `checkboxUncheckedValue` and the attribute `data-unchecked-value` at the same time, in which case the attribute has precedence over the option.
And remember that you can combine it with other options to parse values as well.

```javascript
$('form#checkboxes').serializeJSON({checkboxUncheckedValue: 'NOPE', parseBooleans: true, parseNumbers: true});

// returns =>
{
  'checked': {
    'bool':  true,
    'bin':   1,
    'cool':  'YUP'
  },
  'unchecked': {
    'bool': false, // value from data-unchecked-value attribute, and parsed with parseBooleans
    'bin':  0,     // value from data-unchecked-value attribute, and parsed with parseNumbers
    'cool': 'NOPE' // value from checkboxUncheckedValue option
  }
}
```

## Ignore Empty Form Fields

You can use the option `.serializeJSON(skipFalsyValuesForTypes: ["string"])`, which ignores any string field with an empty value (default type is :string, and empty strings are falsy).

Another option, since `serializeJSON()` is called on a jQuery object, is to just use the proper jQuery selector to skip empty values (see [Issue #28](https://github.com/marioizquierdo/jquery.serializeJSON/issues/28) for more info):

```javascript
// Select only imputs that have a non-empty value
$('form :input[value!=""]').serializeJSON();

// Or filter them from the form
obj = $('form').find('input').not('[value=""]').serializeJSON();

// For more complicated filtering, you can use a function
obj = $form.find(':input').filter(function () {
          return $.trim(this.value).length > 0
      }).serializeJSON();
```


## Ignore Fields With Falsy Values

When using :types, you can also skip falsy values (`false, "", 0, null, undefined, NaN`) by using the option `skipFalsyValuesForFields: ["fullName", "address[city]"]` or `skipFalsyValuesForTypes: ["string", "null"]`.

Or setting a data attribute `data-skip-falsy="true"` on the inputs that should be ignored. Note that `data-skip-falsy` is aware of field :types, so it knows how to skip a non-empty input like this `<input name="foo" value="0" data-value-type="number" data-skip-falsy="true">` (Note that `"0"` as a string is not falsy, but `0` as number is falsy)).


## Use integer keys as array indexes

By default, all serialized keys are **strings**, this includes keys that look like numbers like this:

```html
<form>
  <input type="text" name="arr[0]" value="foo"/>
  <input type="text" name="arr[1]" value="var"/>
  <input type="text" name="arr[5]" value="inn"/>
</form>
```

```javascript
$('form').serializeJSON();

// arr is an object =>
{'arr': {'0': 'foo', '1': 'var', '5': 'inn' }}
```

Which is how Rack [parse_nested_query](http://codefol.io/posts/How-Does-Rack-Parse-Query-Params-With-parse-nested-query) behaves. Remember that serializeJSON input name format is fully compatible with Rails parameters, that are parsed using this Rack method.

Use the option `useIntKeysAsArrayIndex` to interpret integers as array indexes:

```javascript
$('form').serializeJSON({useIntKeysAsArrayIndex: true});

// arr is an array =>
{'arr': ['foo', 'var', undefined, undefined, undefined, 'inn']}
```

**Note**: this was the default behavior of serializeJSON before version 2. You can use this option for backwards compatibility.


## Option Defaults

All options defaults are defined in `$.serializeJSON.defaultOptions`. You can just modify it to avoid setting the option on every call to `serializeJSON`. For example:

```javascript
$.serializeJSON.defaultOptions.checkboxUncheckedValue = ""; // include unckecked checkboxes as empty strings
$.serializeJSON.defaultOptions.customTypes.foo = (str) => { return str + "-foo"; }; // define global custom type ":foo"
```


Alternatives
------------

Other plugins solve the same problem in similar ways:

 * https://github.com/macek/jquery-serialize-object
 * https://github.com/hongymagic/jQuery.serializeObject
 * https://github.com/danheberden/jquery-serializeForm
 * https://github.com/maxatwork/form2js (plain js, no jQuery)
 * https://github.com/serbanghita/formToObject.js (plain js, no jQuery)
 * https://gist.github.com/shiawuen/2634143 (simpler but small)

None of them did what I needed at the time `serializeJSON` was created. Factors that differentiate `serializeJSON` from the alternatives:

 * Simple and small code base. The minimified version is < 1Kb.
 * Yet flexible enough with features like nested objects, unchecked-checkboxes and custom types.
 * Implemented on top of jQuery (or Zepto) `serializeArray`, that creates a JavaScript array of objects, ready to be encoded as a JSON string. It takes into account the W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2), making `serializeJSON` as standard and stable as it can be.
 * The format for the input field names is the same used by Rails (from [Rack::Utils.parse_nested_query](http://codefol.io/posts/How-Does-Rack-Parse-Query-Params-With-parse-nested-query)), that is successfully used by many backend systems and already well understood by many front end developers.
 * Exaustive test suite helps iterate on new releases and bugfixes with confidence.
 * Compatible with [bower](https://github.com/bower/bower), [zepto.js](http://zeptojs.com/) and pretty much every version of [jQuery](https://jquery.com/).


Contributions
-------------

Contributions are awesome. Feature branch *pull requests* are the preferred method. Just make sure to add tests for it. To run the jasmine specs, just open `spec/spec_runner_jquery.html` in your browser.

Changelog
---------

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

Author
-------

Written and maintained by [Mario Izquierdo](https://github.com/marioizquierdo)
