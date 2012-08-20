jquery.serializeJSON
====================

Adds the method `.serializeJSON()` to jQuery, that serializes a form into a JavaScript Object with the same format as the default Ruby on Rails request params hash.

Install
-------

Download the [jquery.serializeJSON.min.js](https://raw.github.com/marioizquierdo/jquery.serializeJSON/master/jquery.serializeJSON.min.js) script and include in your page after jQuery, for example:

```html
<script type="text/javascript" src="jquery.min.js"></script>
<script type="text/javascript" src="jquery.serializeJSON.min.js"></script>
```

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

Why serialize a form?
---------------------

Probably to submit via AJAX, or to handle user input in your JavaScript application.

To submit a form using AJAX, then jQuery `.serialize()` will work just fine. Most backend frameworks will understand the form attribute names and convert them to accessible values that can be easily assigned to your backend models.

Actually, the input name format used by `.serializeJSON()` is borrowed from [Rails Parameter Naming Conventions](http://guides.rubyonrails.org/form_helpers.html#understanding-parameter-naming-conventions).

Anyway, if you want to handle user input in the frontend JavaScript application, then `.serialize()` is not very useful (because it just creates a params string). To copy the right value into the right model, you can do one of the following:

  * Use jQuery `.serializeArray()`: if you don't have nested resources or arrays, then [serializeArray](http://api.jquery.com/serializeArray/) is good enough. But it only works for simple plain attributes.
  * Read the form values one by one using jQuery: If the form is very simple, you can add some noise to your code and read the values with sentences like `var user = {}; user.fullName = $('#user-form').find('input[name=fullName]').val();` (Not recommendable, but definitelly agile if needed).
  * Use declarative bindings: Frameworks like [knockout.js](http://knockoutjs.com/) or [ember.js](http://emberjs.com/) will assign the values to the model automatically using model-view bindings.

Or, if you are using something like [backbone.js](http://backbonejs.org/) or [spine.js](http://spinejs.com/), and you want to assign a form to a Model, a good easy solution is to use `.serializeJSON()` to get the values from the form in the exact same format as you want to create (or modify) the model, for example:

```javascript

var UserView = Backbone.View.extend({
  el: "form#user-form",

  events: {
    "submit": "saveUser"
  },

  saveUser: function(event) {
    var form = $(event.currentTarget);
    var userData = form.serializeJSON();
    this.model.save(this.model.parse(userData));
  }
});

```

Usage details
-------------

Current implementation of `.serializeJSON()` relies in jQuery `.serializeArray()` to grab the form attributes and then create the object using the names.

It means, it will serialize the inputs that are supported by `.serializeArray()`, that uses the standard W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2) to determine which elements it should include; in particular the element cannot be disabled and must contain a name attribute. No submit button value is serialized since the form was not submitted using a button. Data from file select elements is not serialized.

Please take a look at [serializeArray documentation](http://api.jquery.com/serializeArray/) to see more details.

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

 * *1.0.1* (Aug 20, 2012): Bugfix: generated arrays were not being displayed when parsed with JSON.stringify
 * *1.0.0* (Aug 20, 2012): Initial release

Author
-------

Written by [Mario Izquierdo](https://github.com/marioizquierdo)