jquery.serializeJSON
====================

Adds the method `.serializeJSON()` to [jQuery](http://jquery.com/) to serializes a form into a JavaScript Object. Supports the same format for nested parameters that is used in Ruby on Rails.

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
  <input type="text" name="title" value="Dune"/>
  <input type="text" name="author[name]" value="Frank Herbert"/>
  <input type="text" name="author[period]" value="1945–1986"/>
</form>
```

JavaScript:
```javascript
$('form').serializeJSON();

// returns =>
{
  title: "Dune",
  author: {
    name: "Frank Herbert",
    period: "1945–1986"
  }
}
```

Nested attributes and arrays can be specified by naming fields with the syntax: `name="attr[nested][nested]"`.

HTML form:
```html
<form id="my-profile">
  <!-- simple attribute -->
  <input type="text" name="name" value="Mario" />

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
  fullName: "Mario",

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

The `serializeJSON` function returns a JavaScript object, not a JSON String. The plugin should probably have been called `serializeObject` or similar, but that plugin name was already taken.

To convert into a JSON String, use the `JSON.stringify` method, that is available on all major [new browsers](http://caniuse.com/json).
If you need to support very old browsers, just include the [json2.js](https://github.com/douglascrockford/JSON-js) polyfill (as described on [stackoverfow](http://stackoverflow.com/questions/191881/serializing-to-json-in-jquery)).

```javascript
var obj = $('form').serializeJSON();
var jsonString = JSON.stringify(obj);
```

The plugin serializes the same inputs supported by [.serializeArray()](https://api.jquery.com/serializeArray/), following the standard W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2). In particular, the included elements **cannot be disabled** and must contain a **name attribute**. No submit button value is serialized since the form was not submitted using a button. And data from file select elements is not serialized.


Parse values with :types
------------------------

Fields values are `:string` by default. But can be parsed with types by appending a `:type` suffix to the field name:

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

If your field names contain colons (e.g. `name="article[my::key][active]"`) the last part after the colon will be confused as an invalid type. One way to avoid that is to explicitly append the type `:string` (e.g. `name="article[my::key][active]:string"`), or to use the attribute `data-value-type="string"`. Data attributes have precedence over `:type` name suffixes. It is also possible to disable parsing `:type` suffixes with the option `{ disableColonTypes: true }`.


### Custom Types

Use the `customTypes` option to provide your own parsing functions. The parsing functions receive the input name as a string, and the DOM elment of the serialized input.

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
    alwaysBoo: (strVal, el) => {
      // strVal: is the input value as a string
      // el: is the dom element. $(el) would be the jQuery element
      return "boo"; // value returned in the serialization of this type
    },
  }
});

// returns =>
{
  "scary": "boo",  // <-- parsed with custom type "alwaysBoo"
  "str": "str",
  "five": 5,
}
```

The provided `customTypes` can include one of the `detaultTypes` to override the default behavior:

```javascript
$('form').serializeJSON({
  customTypes: {
    alwaysBoo: (strVal) => { return "boo"; },
    string: (strVal) => { return strVal + "-OVERDRIVE"; },
  }
});

// returns =>
{
  "scary": "boo",         // <-- parsed with custom type "alwaysBoo"
  "str": "str-OVERDRIVE", // <-- parsed with custom override "string"
  "five": 5,              // <-- parsed with default type "number"
}
```

Default types used by the plugin are defined in `$.serializeJSON.defaultOptions.defaultTypes`.


Options
-------

With no options, `.serializeJSON()` returns the same as a regular HTML form submission when serialized as Rack/Rails params. In particular:

  * Values are **strings** (unless appending a `:type` to the input name)
  * Unchecked checkboxes are ignored (as defined in the W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2)).
  * Disabled elements are ignored (W3C rules)
  * Keys (input names) are always **strings** (nested params are objects by default)

Available options:

  * **checkboxUncheckedValue: string**, return this value on checkboxes that are not checked. Without this option, they would be ignored. For example: `{checkboxUncheckedValue: ""}` returns an empty string. If the field has a `:type`, the returned value will be properly parsed; for example if the field type is `:boolean`, it returns `false` instead of an empty string.
  * **useIntKeysAsArrayIndex: true**, when using integers as keys (i.e. `<input name="foods[0]" value="banana">`), serialize as an array (`{"foods": ["banana"]}`) instead of an object (`{"foods": {"0": "banana"}`).
  * **skipFalsyValuesForFields: []**, skip given fields (by name) with falsy values. You can use `data-skip-falsy="true"` input attribute as well. Falsy values are determined after converting to a given type, note that `"0"` as `:string` (default) is still truthy, but `0` as `:number` is falsy.
  * **skipFalsyValuesForTypes: []**, skip given fields (by :type) with falsy values (i.e. `skipFalsyValuesForTypes: ["string", "number"]` would skip `""` for `:string` fields, and `0` for `:number` fields).
  * **customTypes: {}**, define your own `:type` functions. Defined as an object like `{ type: function(value){...} }`. For example: `{customTypes: {nullable: function(str){ return str || null; }}`. Custom types extend defaultTypes.
  * **defaultTypes: {defaults}**, contains the orignal type functions `string`, `number`, `boolean`, `null`, `array`, `object` and `skip`.
  * **defaultType: "string"**, fields that have no `:type` suffix and no `data-value-type` attribute are parsed with the `string` type function by default, but it could be changed to use a different type function instead.
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

The `data-unchecked-value` HTML attribute can be used to targed specific values per field:

```html
<form id="checkboxes">
  <input type="checkbox" name="checked[b]:boolean"   value="true" data-unchecked-value="false" checked/>
  <input type="checkbox" name="checked[numb]"        value="1"    data-unchecked-value="0"     checked/>
  <input type="checkbox" name="checked[cool]"        value="YUP"                               checked/>

  <input type="checkbox" name="unchecked[b]:boolean" value="true" data-unchecked-value="false" />
  <input type="checkbox" name="unchecked[numb]"      value="1"    data-unchecked-value="0" />
  <input type="checkbox" name="unchecked[cool]"      value="YUP" /> <!-- No unchecked value specified -->
</form>
```

```javascript
$('form#checkboxes').serializeJSON(); // No option is needed if the data attribute is used

// returns =>
{
  'checked': {
    'b':     true,
    'numb':  '1',
    'cool':  'YUP'
  },
  'unchecked': {
    'bool': false,
    'bin':  '0'
    // 'cool' is not included, because it doesn't use data-unchecked-value
  }
}
```

You can use both the option `checkboxUncheckedValue` and the attribute `data-unchecked-value` at the same time, in which case the option is used as default value (the data attribute has precedence).

```javascript
$('form#checkboxes').serializeJSON({checkboxUncheckedValue: 'NOPE'});

// returns =>
{
  'checked': {
    'b':     true,
    'numb':  '1',
    'cool':  'YUP'
  },
  'unchecked': {
    'bool': false,   // value from data-unchecked-value attribute, and parsed with type "boolean"
    'bin':  '0',     // value from data-unchecked-value attribute
    'cool': 'NOPE'   // value from checkboxUncheckedValue option
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
 * Implementation follows the same rules as the jQuery method `serializeArray`, that creates a JavaScript array of objects, ready to be encoded as a JSON string. Taking into account the W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2) for better compatibility.
 * The format for the input field names is the same used by Rails (from [Rack::Utils.parse_nested_query](http://codefol.io/posts/How-Does-Rack-Parse-Query-Params-With-parse-nested-query)), that is successfully used by many backend systems and already well understood by many front end developers.
 * Exaustive test suite helps iterate on new releases and bugfixes with confidence.
 * Compatible with [bower](https://github.com/bower/bower), [zepto.js](http://zeptojs.com/) and pretty much every version of [jQuery](https://jquery.com/).


Contributions
-------------

Contributions are awesome. Feature branch *pull requests* are the preferred method. Just make sure to add tests for it. To run the jasmine specs, just open `spec/spec_runner_jquery.html` in your browser.

Changelog
---------

See [CHANGELOG.md](./CHANGELOG.md)

Author
-------

Written and maintained by [Mario Izquierdo](https://github.com/marioizquierdo)
