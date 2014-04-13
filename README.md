jquery.serializeJSON
====================

Adds the method `.serializeJSON()` to [jQuery](http://jquery.com/) (or [Zepto](http://zeptojs.com/)), that serializes a form into a JavaScript Object with the same format as the default Ruby on Rails request params hash.


Usage Example
-------------

HTML form (input, textarea and select tags supported):

```html

<form id="user-form">
  <!-- simple attribute -->
  <input type="text" name="fullName"              value="Mario Izquierdo" />

  <!-- object -->
  <input type="text" name="address[city]"         value="San Francisco" />
  <input type="text" name="address[state][name]"  value="California" />
  <input type="text" name="address[state][abbr]"  value="CA" />

  <!-- array -->
  <input type="text" name="jobbies[]"             value="code" />
  <input type="text" name="jobbies[]"             value="climbing" />

  <!-- array of objects -->
  <input type="text" name="projects[0][name]"     value="serializeJSON" />
  <input type="text" name="projects[0][language]" value="javascript" />
  <input type="text" name="projects[1][name]"     value="bettertabs" />
  <input type="text" name="projects[1][language]" value="ruby" />
</form>

```

JavaScript:

```javascript

var user = $('#user-form').serializeJSON();

```

Returned value:

```javascript

// user =>
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

  projects: [
    { name: "serializeJSON", language: "javascript" },
    { name: "bettertabs",    language: "ruby" }
  ]
}

```

The `serializeJSON` function does not return JSON, but an object instead. I should call the plugin `serializeObject` but that name was already taken.


If you really need to serialize into JSON, use the `JSON.strigify` method, that is available on all major [new browsers](http://caniuse.com/json).
If you need to support old browsers, just include the [json2.js](https://github.com/douglascrockford/JSON-js) polyfill (as described on [stackoverfow](http://stackoverflow.com/questions/191881/serializing-to-json-in-jquery)).

```javascript
  var json = JSON.stringify(user);
```

Install
-------

Download the [jquery.serializeJSON.min.js](https://raw.github.com/marioizquierdo/jquery.serializeJSON/master/jquery.serializeJSON.min.js) script and include in your page after jQuery, for example:

```html
<script type="text/javascript" src="jquery.min.js"></script>
<script type="text/javascript" src="jquery.serializeJSON.min.js"></script>
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
 * Compatible with [zepto.js](http://zeptojs.com/).
 * The source code is as small as it can be. The minified version is 1Kb.

Why serialize a form?
---------------------

Probably to submit via AJAX, or to handle user input in your JavaScript application.

To submit a form using AJAX, the jQuery [.serialize()](https://api.jquery.com/serialize/) function should work just fine. Most backend frameworks will understand the form attribute names and convert them to accessible values that can be easily assigned to your backend models.

Actually, the input name format used by `.serializeJSON()` is borrowed from [Rails Parameter Naming Conventions](http://guides.rubyonrails.org/form_helpers.html#understanding-parameter-naming-conventions).

But if you want to handle user input in the frontend JavaScript application, then `.serialize()` is not very useful because it just creates a params string. Other jQuery function is `.serializeArray`, but it doesn't handle nested objects.


Usage details
-------------

Current implementation of `.serializeJSON()` relies in jQuery [.serializeArray()](https://api.jquery.com/serializeArray/) to grab the form attributes and then create the object using the names.

It means, it will serialize the inputs that are supported by `.serializeArray()`, that uses the standard W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2) to determine which elements it should include; in particular the element cannot be disabled and must contain a name attribute. No submit button value is serialized since the form was not submitted using a button. Data from file select elements is not serialized.


### Gotcha ###

In my opinion, the most confusing detail when serializing a form is the input type **checkbox**, that will include the value if checked, and nothing if unchecked.

If you want to add a boolean attribute that can submit true and false values, you have to add a hidden field with the false value *before* the checkbox:

```html
<input type="hidden"   name="booleanAttr" value="false" />
<input type="checkbox" name="booleanAttr" value="true" />
```

This way, the client either sends only the hidden field (representing the check box is unchecked), or both fields. It works because the HTML specification (and the serialize implementation) says key/value pairs have to be sent in the same order they appear in the form, and parameters extraction gets the last occurrence of any repeated key in the query string.

Unfortunately that workaround does not work when the check box goes within an array-like parameter, as in

```html
<input type="hidden"   name="booleanAttrs[]" value="false" />
<input type="checkbox" name="booleanAttrs[]" value="true" />

<input type="hidden"   name="booleanAttrs[]" value="false" />
<input type="checkbox" name="booleanAttrs[]" value="true" />
```

because the serialization will try to add both values as separate elements. For this case, you need to include the array index:

```html
<input type="hidden"   name="booleanAttr[0]" value="false" />
<input type="checkbox" name="booleanAttr[0]" value="true" />

<input type="hidden"   name="booleanAttr[1]" value="false" />
<input type="checkbox" name="booleanAttr[1]" value="true" />
```

Contributions
-------------

Contributions are awesome. Feature branch *pull requests* are the preferred method. Just make sure to add tests for it. To run the jasmine specs, open `spec/SpecRunner.html` in your browser.

Changelog
---------

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
