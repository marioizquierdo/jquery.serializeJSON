jquery.serializeJSON
====================

Adds the method `.serializeJSON()` to [jQuery](http://jquery.com/) (or [Zepto](http://zeptojs.com/)) that serializes a form into a JavaScript Object with the same format as the default Ruby on Rails request params hash.


Usage Example
-------------

HTML form (input, textarea and select tags supported):

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

  <!-- and more ... -->
  <textarea              name="projects[0][name]">serializeJSON</textarea>
  <textarea              name="projects[0][language]">javascript</textarea>
  <input type="hidden"   name="projects[0][popular]" value="0" />
  <input type="checkbox" name="projects[0][popular]" value="1" checked="checked"/>

  <textarea              name="projects[1][name]">tinytest.js</textarea>
  <textarea              name="projects[1][language]">javascript</textarea>
  <input type="hidden"   name="projects[1][popular]" value="0" />
  <input type="checkbox" name="projects[1][popular]" value="1"/>
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
  }
}

```

The `serializeJSON` function returns a JavaScript object, not a JSON String. It should probably have been called `serializeObject`, or something like that, but those names were already taken.

To serialize into JSON, use the `JSON.stringify` method, that is available on all major [new browsers](http://caniuse.com/json).
To support old browsers, just include the [json2.js](https://github.com/douglascrockford/JSON-js) polyfill (as described on [stackoverfow](http://stackoverflow.com/questions/191881/serializing-to-json-in-jquery)).

```javascript
  var json = JSON.stringify(object);
```


Options
-------

By default:

  * Values are always **strings** (no auto boolean/numbers/null detection by default)
  * Keys (names) are always strings (no auto-array detection by default)
  * Unchecked checkboxes are ignored (as defined in the W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2)).
  * Disabled elements are ignored (W3C rules)

This is because `serializeJSON` is designed to return exactly the same as a regular HTML form submission when serialized as Rack/Rails params.

To change the default behavior you have the following options:

  * **parseBooleans: true**, convert strings `"true"` and `"false"` to booleans `true` and `false`.
  * **parseNumbers: true**, convert strings like `"1"`, `"33.33"`, `"-44"` to numbers like `1`, `33.33`, `-44`.
  * **parseNulls: true**, convert the string `"null"` to the null value `null`.
  * **parseAll: true**, all of the above.
  * **parseWithFunction: function**, define your own parse function.
  * **checkboxUncheckedValue: string**, Use this value for unchecked checkboxes, instead of ignoring them. Make sure to use a String. If the value needs to be parsed (i.e. to a Boolean) use a parse option (i.e. `parseBooleans: true`).
  * **useIntKeysAsArrayIndex: true**, when using integers as keys, serialize as an array.

More details about options usage in the sections below.


## Parse Values ##

By default, values are always **strings**, even if they look like booleans, numbers of nulls:

```html
<form>
  <input type="text" name="bool[true]"    value="true"/>
  <input type="text" name="bool[false]"   value="false"/>
  <input type="text" name="number[0]"     value="0"/>
  <input type="text" name="number[1]"     value="1"/>
  <input type="text" name="number[2.2]"   value="2.2"/>
  <input type="text" name="number[-2.25]" value="-2.25"/>
  <input type="text" name="null"          value="null"/>
  <input type="text" name="string"        value="text is always string"/>
  <input type="text" name="empty"         value=""/>
</form>
```

```javascript
$('form').serializeJSON();
// returns =>
{
  "bool": {
    "true": "true",
    "false": "false",
  }
  "number": {
    "0": "0",
    "1": "1",
    "2.2": "2.2",
    "-2.25": "-2.25",
  }
  "null": "null",
  "string": "text is always string",
  "empty": ""
}
```

Note that all values are **strings**. To change this, use the parse options. For example, to parse nulls and numbers:

```javascript
$('form').serializeJSON({parseNulls: true, parseNumbers: true});
// returns =>
{
  "bool": {
    "true": "true", // booleans are still strings, because parseBooleans was not set
    "false": "false",
  }
  "number": {
    "0": 0, // numbers are parsed because parseNumbers: true
    "1": 1,
    "2.2": 2.2,
    "-2.25": -2.25,
  }
  "null": null, // "null" strings are converted to null becase parseNulls: true
  "string": "text is always string",
  "empty": ""
}
```

For rare cases, a custom parser can be defined with a function, for example:

```javascript
var emptyStringsAndZerosToNulls = function(val) {
  if (val === "") return null; // parse empty strings as nulls
  if (val === 0) return null;  // parse 0 as null
  return val;
}

$('form').serializeJSON({parseWithFunction: emptyStringsAndZerosToNulls, parseNumbers: true});
// returns =>
{
  "bool": {
    "true": "true",
    "false": "false",
  }
  "number": {
    "0": null, // <<-- parsed with custom function
    "1": 1,
    "2.2": 2.2,
    "-2.25": -2.25,
  }
  "null": "null",
  "string": "text is always string",
  "empty": null // <<-- parsed with custom function
}

```

## Include unchecked checkboxes ##

In my opinion, the most confusing detail when serializing a form is the input type checkbox, that will include the value if checked, and nothing if unchecked.

To deal with this, it is a common practice to use hidden fields for the "unchecked" values:

```html
<!-- Only one booleanAttr will be serialized, being "true" or "false" depending if the checkbox is selected or not -->
<input type="hidden"   name="booleanAttr" value="false" />
<input type="checkbox" name="booleanAttr" value="true" />
```

This solution is somehow verbose, but it is unobtrusive and ensures progressive enhancement, because it works without JavaScript as well.

But, to make things easier, `serializeJSON` includes the option `checkboxUncheckedValue` and the possibility to add the attribute `data-unchecked-value` to the checkboxes.

For example:

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
{'check1': 'true'} // Note that check2 and check3 are not included because they are not checked
```

Which ignores any unchecked checkboxes.
To include all checkboxes, use the `checkboxUncheckedValue` option like this:

```javascript
$('form').serializeJSON({checkboxUncheckedValue: "false"});
// returns =>
{'check1': 'true', check2: 'false', check3: 'false'}
```

The "unchecked" value can also be specified via the HTML attribute `data-unchecked-value` (Note this attribute is only recognized by the plugin):

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

Serializes like this by default:
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


## Use integer keys as array indexes ##

Using the option `useIntKeysAsArrayIndex`.

For example:

```html
<form>
  <input type="text" name="arr[0]" value="foo"/>
  <input type="text" name="arr[1]" value="var"/>
  <input type="text" name="arr[5]" value="inn"/>
</form>
```

Serializes like this by default:

```javascript
$('form').serializeJSON();
// returns =>
{'arr': {'0': 'foo', '1': 'var', '5': 'inn' }}
```

Which is how the Rack [parse_nested_query](http://codefol.io/posts/How-Does-Rack-Parse-Query-Params-With-parse-nested-query) method behaves (remember that serializeJSON input name format is inspired by Rails parameters, that are parsed using this Rack method).

But to interpret integers as array indexes, use the option `useIntKeysAsArrayIndex`:

```javascript
$('form').serializeJSON({useIntKeysAsArrayIndex: true});
// returns =>
{'arr': ['foo', 'var', undefined, undefined, undefined, 'inn']}
```

**Note**: that this was the default behavior of serializeJSON before version 2. Use this option for backwards compatibility.


## Defaults ##

All options defaults are defined in `$.serializeJSON.defaultOptions`. You can just modify it to avoid setting the option on every call to `serializeJSON`.

For example:

```javascript
$.serializeJSON.defaultOptions.parseAll = true; // parse booleans, numbers and nulls by default

$('form').serializeJSON(); // No options => then use $.serializeJSON.defaultOptions
// returns =>
{
  "bool": {
    "true": true,
    "false": false,
  }
  "number": {
    "0": 0,
    "1": 1,
    "2.2": 2.2,
    "-2.25": -2.25,
  }
  "null": null,
  "string": "text is always string",
  "empty": ""
}
```


Install
-------

Install it like any other jQuery plugin.
For example, download the [jquery.serializejson.min.js](https://raw.githubusercontent.com/marioizquierdo/jquery.serializeJSON/master/jquery.serializejson.min.js) script and include it in your page after jQuery:

```html
<script type="text/javascript" src="jquery.min.js"></script>
<script type="text/javascript" src="jquery.serializejson.min.js"></script>
```

Alternatives
------------

I found others solving the same problem:

 * https://github.com/macek/jquery-serialize-object
 * https://github.com/hongymagic/jQuery.serializeObject
 * https://github.com/danheberden/jquery-serializeForm
 * https://github.com/maxatwork/form2js (plain js, no jQuery)
 * https://github.com/serbanghita/formToObject.js (plain js, no jQuery)
 * https://gist.github.com/shiawuen/2634143 (simpler but small)

But I still think this one is better because:

 * It is built on top of jQuery (or Zepto) `serializeArray`, that creates a JavaScript array of objects, ready to be encoded as a JSON string. It takes in account the W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2), making `serializeJSON` as standard, stable and crossbrowser as it can be.
 * The format suggested for the form field names is the same used by Rails, that is standard and well tested.
 * The spec suite makes sure we don't break functionality on future versions.
 * Compatible with [bower](https://github.com/bower/bower).
 * Compatible with [zepto.js](http://zeptojs.com/) and pretty much every version of jQuery.
 * The source code is as small as it can be. The minified version is 1Kb.

Why serialize a form?
---------------------

Probably to submit via AJAX, or to handle user input in your JavaScript application.

To submit a form using AJAX, the jQuery [.serialize()](https://api.jquery.com/serialize/) function should work just fine. Most backend frameworks will understand the form attribute names and convert them to accessible values that can be easily assigned to your backend models.

Actually, the input name format used by `.serializeJSON()` is borrowed from [Rails Parameter Naming Conventions](http://guides.rubyonrails.org/form_helpers.html#understanding-parameter-naming-conventions).

But if you want to handle user input in the frontend JavaScript application, then `.serialize()` is not very useful because it just creates a params string. Another jQuery function is `.serializeArray`, but it doesn't handle nested objects.


Usage details
-------------

The current implementation of `.serializeJSON()` relies on jQuery's [.serializeArray()](https://api.jquery.com/serializeArray/) to grab the form attributes and then create the object using the names.

It means, it will serialize the inputs that are supported by `.serializeArray()`, that uses the standard W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2) to determine which elements it should include; in particular the element cannot be disabled and must contain a name attribute. No submit button value is serialized since the form was not submitted using a button. Data from file select elements is not serialized.


Contributions
-------------

Contributions are awesome. Feature branch *pull requests* are the preferred method. Just make sure to add tests for it. To run the jasmine specs, open `spec/SpecRunner.html` in your browser.

Changelog
---------

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

Written by [Mario Izquierdo](https://github.com/marioizquierdo)
