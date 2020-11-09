/*!
  SerializeJSON jQuery plugin.
  https://github.com/marioizquierdo/jquery.serializeJSON
  version 3.1.1 (Nov, 2020)

  Copyright (c) 2012-2020 Mario Izquierdo
  Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
  and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*/
(function (factory) {
    /* global define, require, module */
    if (typeof define === "function" && define.amd) { // AMD. Register as an anonymous module.
        define(["jquery"], factory);
    } else if (typeof exports === "object") { // Node/CommonJS
        var jQuery = require("jquery");
        module.exports = factory(jQuery);
    } else { // Browser globals (zepto supported)
        factory(window.jQuery || window.Zepto || window.$); // Zepto supported on browsers as well
    }

}(function ($) {
    "use strict";

    $.fn.serializeJSON = function (options) {
        var f = $.serializeJSON;
        var $form = this; // NOTE: the set of matched elements is most likely a form, but it could also be a group of inputs
        var opts = f.setupOpts(options); // validate and apply defaults
        var typeFunctions = $.extend({}, opts.defaultTypes, opts.customTypes);

        // Use native `serializeArray` function to get an array of {name, value} objects.
        var formAsArray = $form.serializeArray();
        f.readCheckboxUncheckedValues(formAsArray, opts, $form); // add objects to the array from unchecked checkboxes if needed

        // Convert the formAsArray into a serializedObject with nested keys
        var serializedObject = {};
        $.each(formAsArray, function (_i, obj) {
            var rawName  = obj.name; // original input name
            var rawValue = obj.value; // input value

            // Parse type
            var name = rawName;
            var type = f.attrFromInputWithName($form, rawName, "data-value-type");
            if (!type && !opts.disableColonTypes) {
                var p = f.splitType(rawName); // "foo:string" => ["foo", "string"]
                name = p[0];
                type = p[1];
            }
            if (type === "skip") {
                return; // ignore fields with type skip
            }
            if (!type) {
                type = opts.defaultType; // "string" by default
            }

            var typedValue = f.applyTypeFunc(rawName, rawValue, type, typeFunctions); // Parse type as string, number, etc.

            if (!typedValue && f.shouldSkipFalsy($form, rawName, name, type, opts)) {
                return; // ignore falsy inputs if specified in the options
            }

            var keys = f.splitInputNameIntoKeysArray(name);
            f.deepSet(serializedObject, keys, typedValue, opts);
        });
        return serializedObject;
    };

    // Use $.serializeJSON as namespace for the auxiliar functions
    // and to define defaults
    $.serializeJSON = {
        defaultOptions: {}, // reassign to override option defaults for all serializeJSON calls

        defaultBaseOptions: { // do not modify, use defaultOptions instead
            checkboxUncheckedValue: undefined, // to include that value for unchecked checkboxes (instead of ignoring them)
            useIntKeysAsArrayIndex: false, // name="foo[2]" value="v" => {foo: [null, null, "v"]}, instead of {foo: ["2": "v"]}

            skipFalsyValuesForTypes: [], // skip serialization of falsy values for listed value types
            skipFalsyValuesForFields: [], // skip serialization of falsy values for listed field names

            disableColonTypes: false, // do not interpret ":type" suffix as a type
            customTypes: {}, // extends defaultTypes
            defaultTypes: {
                "string":  function(str) { return String(str); },
                "number":  function(str) { return Number(str); },
                "boolean": function(str) { var falses = ["false", "null", "undefined", "", "0"]; return falses.indexOf(str) === -1; },
                "null":    function(str) { var falses = ["false", "null", "undefined", "", "0"]; return falses.indexOf(str) === -1 ? str : null; },
                "array":   function(str) { return JSON.parse(str); },
                "object":  function(str) { return JSON.parse(str); },
                "skip":    null // skip is a special type used to ignore fields
            },
            defaultType: "string",
        },

        // Validate and set defaults
        setupOpts: function(options) {
            if (options == null) options = {};
            var f = $.serializeJSON;

            // Validate
            var validOpts = [
                "checkboxUncheckedValue",
                "useIntKeysAsArrayIndex",

                "skipFalsyValuesForTypes",
                "skipFalsyValuesForFields",

                "disableColonTypes",
                "customTypes",
                "defaultTypes",
                "defaultType"
            ];
            for (var opt in options) {
                if (validOpts.indexOf(opt) === -1) {
                    throw new  Error("serializeJSON ERROR: invalid option '" + opt + "'. Please use one of " + validOpts.join(", "));
                }
            }

            // Helper to get options or defaults
            return $.extend({}, f.defaultBaseOptions, f.defaultOptions, options);
        },

        // Parse value with type function
        applyTypeFunc: function(name, valStr, type, typeFunctions) {
            var typeFunc = typeFunctions[type];
            if (!typeFunc) { // quick feedback to user if there is a typo or missconfiguration
                throw new Error("serializeJSON ERROR: Invalid type " + type + " found in input name '" + name + "', please use one of " + objectKeys(typeFunctions).join(", "));
            }
            return typeFunc(valStr);
        },

        // Fill the formAsArray object with values for the unchecked checkbox inputs,
        // using the same format as the jquery.serializeArray function.
        // The value of the unchecked values is determined from the opts.checkboxUncheckedValue
        // and/or the data-unchecked-value attribute of the inputs.
        readCheckboxUncheckedValues: function (formAsArray, opts, $form) {
            if (opts == null) { opts = {}; }

            var selector = "input[type=checkbox][name]:not(:checked):not([disabled])";
            var $uncheckedCheckboxes = $form.find(selector).add($form.filter(selector));
            $uncheckedCheckboxes.each(function (_i, el) {
                // Check data attr first, then the option
                var $el = $(el);
                var uncheckedValue = $el.attr("data-unchecked-value");
                if (uncheckedValue == null) {
                    uncheckedValue = opts.checkboxUncheckedValue;
                }

                // If there's an uncheckedValue, push it into the serialized formAsArray
                if (uncheckedValue != null) {
                    if (el.name && el.name.indexOf("[][") !== -1) { // identify a non-supported
                        throw new Error("serializeJSON ERROR: checkbox unchecked values are not supported on nested arrays of objects like '"+el.name+"'. See https://github.com/marioizquierdo/jquery.serializeJSON/issues/67");
                    }
                    formAsArray.push({name: el.name, value: uncheckedValue});
                }
            });
        },

        // Splits a field name into the name and the type. Examples:
        //   "foo"           =>  ["foo", ""]
        //   "foo:boolean"   =>  ["foo", "boolean"]
        //   "foo[bar]:null" =>  ["foo[bar]", "null"]
        splitType : function(name) {
            var parts = name.split(":");
            if (parts.length > 1) {
                var t = parts.pop();
                return [parts.join(":"), t];
            } else {
                return [name, ""];
            }
        },


        // Check if this input should be skipped when it has a falsy value,
        // depending on the options to skip values by name or type, and the data-skip-falsy attribute.
        shouldSkipFalsy: function($form, name, nameWithNoType, type, opts) {
            var f = $.serializeJSON;

            var skipFromDataAttr = f.attrFromInputWithName($form, name, "data-skip-falsy");
            if (skipFromDataAttr != null) {
                return skipFromDataAttr !== "false"; // any value is true, except if explicitly using 'false'
            }

            var optForFields = opts.skipFalsyValuesForFields;
            if (optForFields && (optForFields.indexOf(nameWithNoType) !== -1 || optForFields.indexOf(name) !== -1)) {
                return true;
            }

            var optForTypes = opts.skipFalsyValuesForTypes;
            if (type == null) type = "string"; // assume fields with no type are targeted as string
            if (optForTypes && optForTypes.indexOf(type) !== -1) {
                return true;
            }

            return false;
        },

        // Finds the first input in $form with this name, and get the given attr from it.
        // Returns undefined if no input or no attribute was found.
        attrFromInputWithName: function($form, name, attrName) {
            var escapedName = name.replace(/(:|\.|\[|\]|\s)/g, "\\$1"); // every non-standard character need to be escaped by \\
            var selector = "[name=\"" + escapedName + "\"]";
            var $input = $form.find(selector).add($form.filter(selector)); // NOTE: this returns only the first $input element if multiple are matched with the same name (i.e. an "array[]"). So, arrays with different element types specified through the data-value-type attr is not supported.
            return $input.attr(attrName);
        },

        // Split the input name in programatically readable keys.
        // Examples:
        // "foo"              => ["foo"]
        // "[foo]"            => ["foo"]
        // "foo[inn][bar]"    => ["foo", "inn", "bar"]
        // "foo[inn[bar]]"    => ["foo", "inn", "bar"]
        // "foo[inn][arr][0]" => ["foo", "inn", "arr", "0"]
        // "arr[][val]"       => ["arr", "", "val"]
        splitInputNameIntoKeysArray: function(nameWithNoType) {
            var keys = nameWithNoType.split("["); // split string into array
            keys = $.map(keys, function (key) { return key.replace(/\]/g, ""); }); // remove closing brackets
            if (keys[0] === "") { keys.shift(); } // ensure no opening bracket ("[foo][inn]" should be same as "foo[inn]")
            return keys;
        },

        // Set a value in an object or array, using multiple keys to set in a nested object or array.
        // This is the main function of the script, that allows serializeJSON to use nested keys.
        // Examples:
        //
        // deepSet(obj, ["foo"], v)               // obj["foo"] = v
        // deepSet(obj, ["foo", "inn"], v)        // obj["foo"]["inn"] = v // Create the inner obj["foo"] object, if needed
        // deepSet(obj, ["foo", "inn", "123"], v) // obj["foo"]["arr"]["123"] = v //
        //
        // deepSet(obj, ["0"], v)                                   // obj["0"] = v
        // deepSet(arr, ["0"], v, {useIntKeysAsArrayIndex: true})   // arr[0] = v
        // deepSet(arr, [""], v)                                    // arr.push(v)
        // deepSet(obj, ["arr", ""], v)                             // obj["arr"].push(v)
        //
        // arr = [];
        // deepSet(arr, ["", v]          // arr => [v]
        // deepSet(arr, ["", "foo"], v)  // arr => [v, {foo: v}]
        // deepSet(arr, ["", "bar"], v)  // arr => [v, {foo: v, bar: v}]
        // deepSet(arr, ["", "bar"], v)  // arr => [v, {foo: v, bar: v}, {bar: v}]
        //
        deepSet: function (o, keys, value, opts) {
            if (opts == null) { opts = {}; }
            var f = $.serializeJSON;
            if (isUndefined(o)) { throw new Error("ArgumentError: param 'o' expected to be an object or array, found undefined"); }
            if (!keys || keys.length === 0) { throw new Error("ArgumentError: param 'keys' expected to be an array with least one element"); }

            var key = keys[0];

            // Only one key, then it's not a deepSet, just assign the value in the object or add it to the array.
            if (keys.length === 1) {
                if (key === "") { // push values into an array (o must be an array)
                    o.push(value);
                } else {
                    o[key] = value; // keys can be object keys (strings) or array indexes (numbers)
                }
                return;
            }

            var nextKey = keys[1]; // nested key
            var tailKeys = keys.slice(1); // list of all other nested keys (nextKey is first)

            if (key === "") { // push nested objects into an array (o must be an array)
                var lastIdx = o.length - 1;
                var lastVal = o[lastIdx];

                // if the last value is an object or array, and the new key is not set yet
                if (isObject(lastVal) && isUndefined(f.deepGet(lastVal, tailKeys))) {
                    key = lastIdx; // then set the new value as a new attribute of the same object
                } else {
                    key = lastIdx + 1; // otherwise, add a new element in the array
                }
            }

            if (nextKey === "") { // "" is used to push values into the nested array "array[]"
                if (isUndefined(o[key]) || !$.isArray(o[key])) {
                    o[key] = []; // define (or override) as array to push values
                }
            } else {
                if (opts.useIntKeysAsArrayIndex && isValidArrayIndex(nextKey)) { // if 1, 2, 3 ... then use an array, where nextKey is the index
                    if (isUndefined(o[key]) || !$.isArray(o[key])) {
                        o[key] = []; // define (or override) as array, to insert values using int keys as array indexes
                    }
                } else { // nextKey is going to be the nested object's attribute
                    if (isUndefined(o[key]) || !isObject(o[key])) {
                        o[key] = {}; // define (or override) as object, to set nested properties
                    }
                }
            }

            // Recursively set the inner object
            f.deepSet(o[key], tailKeys, value, opts);
        },

        deepGet: function (o, keys) {
            var f = $.serializeJSON;
            if (isUndefined(o) || isUndefined(keys) || keys.length === 0 || (!isObject(o) && !$.isArray(o))) {
                return o;
            }
            var key = keys[0];
            if (key === "") { // "" means next array index (used by deepSet)
                return undefined;
            }
            if (keys.length === 1) {
                return o[key];
            }
            var tailKeys = keys.slice(1);
            return f.deepGet(o[key], tailKeys);
        }
    };

    // polyfill Object.keys to get option keys in IE<9
    var objectKeys = function(obj) {
        if (Object.keys) {
            return Object.keys(obj);
        } else {
            var key, keys = [];
            for (key in obj) { keys.push(key); }
            return keys;
        }
    };

    var isObject =          function(obj) { return obj === Object(obj); }; // true for Objects and Arrays
    var isUndefined =       function(obj) { return obj === void 0; }; // safe check for undefined values
    var isValidArrayIndex = function(val) { return /^[0-9]+$/.test(String(val)); }; // 1,2,3,4 ... are valid array indexes
}));
