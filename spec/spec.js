// serializeJSON
/* eslint-env jasmine, jquery */
describe("$.serializeJSON", function() {
    var obj, $form;

    it("accepts a jQuery or Zepto object with a form", function() {
        $form = form([
            inputText("1", "1"),
            inputText("2", "2"),
        ]);
        obj = $form.serializeJSON();
        expect(obj).toEqual({"1": "1", "2": "2"});
    });

    // Features only in jQuery (not supported in Zepto)
    if ($.fn.jquery) {
        it("accepts a jQuery object with inputs", function() {
            var $inputs = $("<input type=\"text\" name=\"1\" value=\"1\"/>").add($("<input type=\"text\" name=\"2\" value=\"2\"/>"));
            obj = $inputs.serializeJSON();
            expect(obj).toEqual({"1": "1", "2": "2"});
        });

        it("accepts a jQuery object with forms and inputs", function() {
            var $form1 = form([
                inputText("1", "1"),
                inputText("2", "2")
            ]);
            var $form2 = form([
                inputText("3", "3"),
                inputText("4", "4")
            ]);
            var $inputs = inputText("5", "5").add(inputText("6", "6"));
            var $els = $form1.add($form2).add($inputs);

            obj = $els.serializeJSON();
            expect(obj).toEqual({"1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6"});
        });
    }

    it("serializes simple one-level attributes", function() {
        $form = form([
            inputText("firstName", "Mario"),
            inputText("lastName", "Izquierdo"),
        ]);

        obj = $form.serializeJSON();
        expect(obj).toEqual({
            firstName: "Mario",
            lastName: "Izquierdo"
        });
    });

    it("serializes nested object attributes", function() {
        $form = form([
            inputText("address[city]",        "San Francisco"),
            inputText("address[state][name]", "California"),
            inputText("address[state][abbr]", "CA"),
        ]);

        obj = $form.serializeJSON();
        expect(obj).toEqual({
            address: {
                city: "San Francisco",
                state: { name: "California", abbr: "CA" }
            }
        });
    });

    it("serializes attribute names that look like integers as string object keys by default", function() {
        $form = form([
            inputText("foo[0]",    "zero"),
            inputText("foo[1]",    "one"),
            inputText("foo[2][0]", "two-zero"),
            inputText("foo[2][1]", "two-one"),
        ]);

        obj = $form.serializeJSON();
        expect(obj).toEqual({
            "foo": {
                "0": "zero",
                "1": "one",
                "2": {
                    "0": "two-zero",
                    "1": "two-one"
                }
            }
        });
    });

    describe("unindexed arrays ([])", function() {
        it("pushes elements into the array", function() {
            $form = form([
                inputText("jobbies[]", "code"),
                inputText("jobbies[]", "climbing"),
            ]);

            obj = $form.serializeJSON();
            expect(obj).toEqual({
                jobbies: ["code", "climbing"]
            });
        });

        it("pushes nested objects if nested keys are repeated", function() {
            $form = form([
                inputText("projects[][name]",     "serializeJSON"),
                inputText("projects[][language]", "javascript"),

                inputText("projects[][name]",     "bettertabs"),
                inputText("projects[][language]", "ruby"),

                inputText("projects[][name]",     "formwell"),
                inputText("projects[][morelanguages][]", "coffeescript"),
                inputText("projects[][morelanguages][]", "javascript"),

                inputText("people[][name][first]", "Bruce"),
                inputText("people[][name][last]",  "Lee"),
                inputText("people[][age]:number", "33"),

                inputText("people[][name][first]", "Morihei"),
                inputText("people[][name][last]", "Ueshiba"),
                inputText("people[][age]:number", "86"),
            ]);

            obj = $form.serializeJSON();
            expect(obj).toEqual({
                projects: [
                    { name: "serializeJSON", language: "javascript" },
                    { name: "bettertabs",    language: "ruby" },
                    { name: "formwell",      morelanguages: ["coffeescript", "javascript"] },
                ],
                people: [
                    { name: {first: "Bruce", last: "Lee"}, age: 33 },
                    { name: {first: "Morihei", last: "Ueshiba"}, age: 86 }
                ],
            });
        });
    });

    describe("select multiple", function() {
        it("serializes all the selected elements as an array", function() {
            $form = form([
                inputSelectMultiple("camels[]", [
                    selectOption("1").prop("selected", true),
                    selectOption("2"),
                    selectOption("3").prop("selected", true),
                ]),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({camels: ["1", "3"]});
        });
        it("ignores the field if nothing is selected", function() {
            $form = form([
                inputSelectMultiple("camels[]", [
                    selectOption("1"),
                    selectOption("2"),
                    selectOption("3"),
                ]),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({}); // nothing serialized
        });
        it("can be set to empty array if using a hidden field", function() {
            $form = form([
                inputHidden("camels:array", "[]"),
                inputSelectMultiple("camels[]", [
                    selectOption("1"),
                    selectOption("2"),
                    selectOption("3"),
                ]),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({camels: []}); // empty array from the hidden field
        });
    });

    it("overrides existing properties and keeps the last property value only", function() {
        $form = form([
            inputText("str", "String"),
            inputText("str", "String Override"),

            inputText("array", "a string that was there before"),
            inputText("array[]", "one"),
            inputText("array[]", "two"),

            inputText("crosstype",         "str"),
            inputText("crosstype:number",  "2"),
            inputText("crosstype:boolean", "true"),

            inputHidden("object", ""),
            inputText("object[nested]",         "blabla"),
            inputText("object[nested][nested]", "final value"),
        ]);

        obj = $form.serializeJSON();
        expect(obj).toEqual({
            str: "String Override",
            array: ["one", "two"],
            crosstype: true,
            object: { nested: { nested: "final value" }}
        });
    });

    describe("unchecked checkboxes", function() {
        it("are ignored by default like in regural HTML forms and the jQuery.serializeArray function", function() {
            $form = form([
                inputCheckbox("check1", "yes"),
                inputCheckbox("check2", "yes"),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({}); // empty because unchecked checkboxes are ignored
        });

        it("are ignored also in arrays", function() {
            $form = form([
                inputCheckbox("flags[]", "green"),
                inputCheckbox("flags[]", "red"),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({});
        });

        it("could use a hidden field with type :array to force an empty array in an array of unchecked checkboxes", function() {
            $form = form([
                inputHidden("flags:array", "[]"),
                inputCheckbox("flags[]", "green"),
                inputCheckbox("flags[]", "red"),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({"flags": []});

            $form.find("input[value=\"red\"]").prop("checked", true);
            obj = $form.serializeJSON();
            expect(obj).toEqual({"flags": ["red"]});
        });

        it("can be combined with hidden fields to set the false value", function() {
            $form = form([
                inputHidden("truthy", "0"),
                inputCheckbox("truthy", "1").prop("checked", true), // should keep "1"
                inputHidden("falsy", "0"),
                inputCheckbox("falsy", "1"), // should keep "0", from the hidden field
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({
                truthy: "1", // from the checkbok
                falsy:  "0"  // from the hidden field
            });
        });

        it("are ignored if they have no name attribute", function() {
            $form = form([
                $("<input type=\"checkbox\" value=\"yes\"/>"),
                $("<input type=\"checkbox\" value=\"yes\"/>"),
            ]);
            obj = $form.serializeJSON({checkboxUncheckedValue: "NOPE"});
            expect(obj).toEqual({});
        });

        it("use the checkboxUncheckedValue option if defined", function() {
            $form = form([
                inputCheckbox("check1", "yes"),
                inputCheckbox("check2", "yes"),
            ]);
            obj = $form.serializeJSON({checkboxUncheckedValue: "NOPE"});
            expect(obj).toEqual({check1: "NOPE", check2: "NOPE"});
        });

        it("use the attr data-unchecked-value if defined", function() {
            $form = form([
                inputCheckbox("check1", "yes"), // ignored
                inputCheckbox("check2", "yes").attr("data-unchecked-value", "NOPE"),
            ]);
            obj = $form.serializeJSON(); // NOTE: no checkboxUncheckedValue used
            expect(obj).toEqual({check2: "NOPE"});
        });
    });

    describe(":number type", function() {
        it("parses numbers", function() {
            $form = form([
                inputText("i1:number", "10"),
                inputText("i2:number", "10.5"),
                inputText("un",        "10"),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({i1: 10, i2: 10.5, un: "10"});
        });
        it("parses non numbers to NaN", function(){
            $form = form([
                inputText("i1:number", "text"),
                inputText("i2:number", "null"),
                inputText("i3:number", "false"),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({i1: NaN, i2: NaN, i3: NaN});
        });
    });

    describe(":boolean type", function() {
        it("parses anything that looks truthy to true", function() {
            $form = form([
                inputText("b1:boolean", "true"),
                inputText("b2:boolean", "TRUE"),
                inputText("b3:boolean", "yes"),
                inputText("b4:boolean", "[1,2,3]"),
                inputText("b5:boolean", "Bla bla bla bla ..."),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({b1: true, b2: true, b3: true, b4: true, b5: true});
        });
        it("parses anything that looks falsy to false", function() {
            $form = form([
                inputText("b1:boolean", "false"),
                inputText("b2:boolean", "null"),
                inputText("b3:boolean", "undefined"),
                inputText("b4:boolean", ""),
                inputText("b5:boolean", "0"),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({b1: false, b2: false, b3: false, b4: false, b5: false});
        });
    });
    describe(":null type", function() {
        it("parses anything that looks falsy to null", function() {
            $form = form([
                inputText("b1:null", "false"),
                inputText("b2:null", "null"),
                inputText("b3:null", "undefined"),
                inputText("b4:null", ""),
                inputText("b5:null", "0"),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({b1: null, b2: null, b3: null, b4: null, b5: null});
        });
        it("keeps anything that looks truthy as string", function() {
            $form = form([
                inputText("b1:null", "true"),
                inputText("b2:null", "TRUE"),
                inputText("b3:null", "yes"),
                inputText("b4:null", "[1,2,3]"),
                inputText("b5:null", "Bla bla bla bla ..."),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({b1: "true", b2: "TRUE", b3: "yes", b4: "[1,2,3]", b5: "Bla bla bla bla ..."});
        });
    });
    describe(":string type", function() {
        it("keeps everything as string", function() {
            $form = form([
                inputText("b1:string", "true"),
                inputText("b2:string", "TRUE"),
                inputText("b3:string", "yes"),
                inputText("b4:string", "[1,2,3]"),
                inputText("b5:string", "Bla bla bla bla ..."),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({b1: "true", b2: "TRUE", b3: "yes", b4: "[1,2,3]", b5: "Bla bla bla bla ..."});
        });
    });
    describe(":array type", function() {
        it("parses arrays with JSON.parse", function() {
            $form = form([
                inputText("b1:array", "[]"),
                inputText("b2:array", "[\"my\", \"stuff\"]"),
                inputText("b3:array", "[1,2,3]"),
                inputText("b4:array", "[1,[2,[3]]]"),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({b1: [], b2: ["my", "stuff"], b3: [1,2,3], b4: [1,[2,[3]]]});
        });
        it("raises an error if the array can not be parsed", function() {
            $form = form([
                inputText("b1:array", "<NOT_AN_ARRAY>"),
            ]);
            expect(function(){$form.serializeJSON();}).toThrow();
        });
    });
    describe(":object type", function() {
        it("parses objects with JSON.parse", function() {
            $form = form([
                inputText("b1:object", "{}"),
                inputText("b2:object", "{\"my\": \"stuff\"}"),
                inputText("b3:object", "{\"my\": {\"nested\": \"stuff\"}}"),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({b1: {}, b2: {"my": "stuff"}, b3: {"my": {"nested": "stuff"}}});
        });
        it("raises an error if the obejct can not be parsed", function() {
            $form = form([
                inputText("b1:object", "<NOT_AN_OBJECT>"),
            ]);
            expect(function(){$form.serializeJSON();}).toThrow();
        });
    });
    describe(":skip type", function() {
        it("removes the field from the parsed result", function() {
            $form = form([
                inputText("b1",           "Im in"),
                inputText("b2:skip",      "Im out"),
                inputText("b3[out]:skip", "Im out"),
            ]);
            obj = $form.serializeJSON();
            expect(obj).toEqual({b1: "Im in"});
        });
        it("raises an error if the obejct can not be parsed", function() {
            $form = form([
                inputText("b1:object", "<NOT_A_JSON_OBJECT>"),
            ]);
            expect(function(){$form.serializeJSON();}).toThrow();
        });
    });
    describe("invalid types", function() {
        it("raises an error if the type is not known", function() {
            $form = form([
                inputText("b1:kaka", "not a valid type"),
            ]);
            expect(function(){ $form.serializeJSON(); })
                .toThrow(new Error("serializeJSON ERROR: Invalid type kaka found in input name 'b1:kaka', please use one of string, number, boolean, null, array, object, skip"));
        });
    });
    describe("form with multiple types", function() {
        it("parses every type as expected", function() { // EXAMPLE from the README file
            $form = form([
                inputText("notype",           "default type is :string"),
                inputText("string:string",    ":string type overrides parsing options"),
                inputText("excludes:skip",    "Use :skip to not include this field in the result"),

                inputText("number[1]:number",           "1"),
                inputText("number[1.1]:number",         "1.1"),
                inputText("number[other stuff]:number", "other stuff"),

                inputText("boolean[true]:boolean",      "true"),
                inputText("boolean[false]:boolean",     "false"),
                inputText("boolean[0]:boolean",         "0"),

                inputText("null[null]:null",            "null"),
                inputText("null[other stuff]:null",     "other stuff"),

                inputText("array[empty]:array",         "[]"),
                inputText("array[not empty]:array",     "[1, 2, 3]"),

                inputText("object[empty]:object",       "{}"),
                inputText("object[not empty]:object",   "{\"my\": \"stuff\"}"),
            ]);

            obj = $form.serializeJSON();
            expect(obj).toEqual({
                "notype": "default type is :string",
                "string": ":string type overrides parsing options",
                // :skip type removes the field from the output
                "number": {
                    "1": 1,
                    "1.1": 1.1,
                    "other stuff": NaN, // <-- Other stuff parses as NaN (Not a Number)
                },
                "boolean": {
                    "true": true,
                    "false": false,
                    "0": false, // <-- "false", "null", "undefined", "", "0" parse as false
                },
                "null": {
                    "null": null, // <-- "false", "null", "undefined", "", "0" parse as null
                    "other stuff": "other stuff"
                },
                "array": { // <-- works using JSON.parse
                    "empty": [],
                    "not empty": [1,2,3]
                },
                "object": { // <-- works using JSON.parse
                    "empty": {},
                    "not empty": {"my": "stuff"}
                }
            });
        });
    });

    describe("data-value-type attribute", function() {
        it("should set type and have precedence over the :type suffix", function() {
            $form = form([
                inputText("fooData", "0").attr("data-value-type", "alwaysBoo"),
                inputText("fooDataWithBrackets[kokoszka]", "0").attr("data-value-type", "alwaysBoo"),
                inputText("fooDataWithBrackets[kokoszka i cos innego]", "0").attr("data-value-type", "alwaysBoo"),
                inputText("foo:alwaysBoo", "string from data attr").attr("data-value-type", "string"),
                inputText("override::string", "boolean prevails").attr("data-value-type", "boolean"),
                inputText("notype", "default type is :string"),
                inputText("excludes", "Use :skip to not include this field in the result").attr("data-value-type", "skip"),
                inputText("numberData", "1").attr("data-value-type", "number"),
                inputText("numberData[A]", "1").attr("data-value-type", "number"),
                inputText("numberData[B][C]", "2").attr("data-value-type", "number"),
                inputText("numberData[D][E][F]", "3").attr("data-value-type", "number"),
                inputText("number", "1").attr("data-value-type", "number"),
                inputSelect("selectNumber", [
                    selectOption("1"),
                    selectOption("2").prop("selected", true),
                ]).attr("data-value-type", "number"),
            ]);

            obj = $form.serializeJSON({
                customTypes: {
                    alwaysBoo: function() { return "Boo"; }
                }
            });

            expect(obj).toEqual({
                "fooDataWithBrackets": {
                    kokoszka: "Boo",
                    "kokoszka i cos innego": "Boo"
                },
                "fooData": "Boo",
                "foo:alwaysBoo": "string from data attr",
                "override::string": true,
                "notype": "default type is :string",
                // excludes was excluded because of type "skip"
                "numberData": { A: 1, B: { C: 2 }, D: { E: { F: 3 } } },
                "number": 1,
                "selectNumber": 2
            });
        });

        if ($.fn.jquery) { // not supported on Zepto
            it("also works for matched inputs (not just forms) if they have the data-value-type attribute", function() {
                var $inputs = $(
                    "<input type=\"text\" name=\"fooData\" data-value-type=\"alwaysBoo\"   value=\"0\"/>" +
                    "<input type=\"text\" name=\"foo:alwaysBoo\" data-value-type=\"string\"   value=\"0\"/>" +
                    "<input type=\"text\" name=\"notype\" value=\"default type is :string\"/>" +
                    "<input type=\"text\" name=\"number\" data-value-type=\"number\"   value=\"1\"/>"
                );

                obj = $inputs.serializeJSON({
                    customTypes: {
                        alwaysBoo: function() { return "Boo"; }
                    }
                });
                expect(obj).toEqual({
                    "fooData": "Boo",
                    "foo:alwaysBoo": "0",
                    "notype": "default type is :string",
                    "number": 1
                });
            });
        }
    });

    describe("data-skip-falsy attribute", function() {
        it("allows to skip faily fields, just like with the option skipFalsyValuesForFields", function() {
            var $form2 = form([
                inputText("skipFalsyZero:number",    "0"    ).attr("data-skip-falsy", "true"),
                inputText("skipFalsyFalse:boolean",  "false").attr("data-skip-falsy", "true"),
                inputText("skipFalsyNull:null",      "null" ).attr("data-skip-falsy", "true"),
                inputText("skipFalsyEmpty:string",   ""     ).attr("data-skip-falsy", "true"),
                inputText("skipFalsyFoo:string",     "foo"  ).attr("data-skip-falsy", "true"),
                inputText("zero:number",  "0"),
                inputText("foo:string",   "foo"),
                inputText("empty:string", ""),
            ]);

            obj = $form2.serializeJSON();
            expect(obj["skipFalsyZero"]).toEqual(undefined);  // skip
            expect(obj["skipFalsyFalse"]).toEqual(undefined); // skip
            expect(obj["skipFalsyNull"]).toEqual(undefined);  // skip
            expect(obj["skipFalsyEmpty"]).toEqual(undefined); // skip
            expect(obj["skipFalsyFoo"]).toEqual("foo");
            expect(obj["zero"]).toEqual(0);
            expect(obj["foo"]).toEqual("foo");
            expect(obj["empty"]).toEqual("");
        });

        it("overrides the option skipFalsyValuesForFields", function() {
            var $form2 = form([
                inputText("skipFalsyZero:number",   "0"    ).attr("data-skip-falsy", "true"),
                inputText("skipFalsyFalse:boolean", "false").attr("data-skip-falsy", "false"),
                inputText("skipFalsyNull:null",     "null" ).attr("data-skip-falsy", "false"),
                inputText("skipFalsyEmpty:string",  ""     ).attr("data-skip-falsy", "true"),
                inputText("skipFalsyFoo:string",    "foo"  ).attr("data-skip-falsy", "true"),
                inputText("zero:number", "0"),
                inputText("empty:string", ""),
            ]);

            obj = $form2.serializeJSON({ skipFalsyValuesForFields: [ // using skipFalsyValuesForFields option
                "skipFalsyZero",
                "skipFalsyFalse",
                "skipFalsyNull",
                "zero"
            ]});
            expect(obj["skipFalsyZero"]).toEqual(undefined);  // skip from attr and opt
            expect(obj["skipFalsyFalse"]).toEqual(false); // not skip (attr override)
            expect(obj["skipFalsyNull"]).toEqual(null);  // not skip (attr override)
            expect(obj["skipFalsyEmpty"]).toEqual(undefined); // skip from attr
            expect(obj["skipFalsyFoo"]).toEqual("foo");
            expect(obj["zero"]).toEqual(undefined); // skip from opt
            expect(obj["empty"]).toEqual("");
        });

        it("overrides the option skipFalsyValuesForTypes", function() {
            var $form2 = form([
                inputText("skipFalsyZero:number",    "0"    ).attr("data-skip-falsy", "true"),
                inputText("skipFalsyFalse:boolean",  "false").attr("data-skip-falsy", "false"),
                inputText("skipFalsyNull:null",      "null" ).attr("data-skip-falsy", "false"),
                inputText("skipFalsyEmpty:string",   ""     ).attr("data-skip-falsy", "true"),
                inputText("skipFalsyFoo:string",     "foo"  ).attr("data-skip-falsy", "true"),
                inputText("zero:number",  "0"),
                inputText("empty:string", ""),
                inputText("null:null",    "null"),
            ]);

            obj = $form2.serializeJSON({ skipFalsyValuesForTypes: [ // using skipFalsyValuesForFields option
                "number",
                "boolean",
                "null"
            ]});
            expect(obj["skipFalsyZero"]).toEqual(undefined);  // skip from attr and opt
            expect(obj["skipFalsyFalse"]).toEqual(false); // not skip (attr override)
            expect(obj["skipFalsyNull"]).toEqual(null);  // not skip (attr override)
            expect(obj["skipFalsyEmpty"]).toEqual(undefined); // skip from attr
            expect(obj["skipFalsyFoo"]).toEqual("foo");
            expect(obj["zero"]).toEqual(undefined); // skip from opt
            expect(obj["empty"]).toEqual("");
            expect(obj["null"]).toEqual(undefined); // skip from opt
        });
    });

    // options
    describe("options", function() {
        var $form;
        beforeEach(function() {
            $form = form([
                inputText("Numeric 0",     "0"),
                inputText("Numeric 1",     "1"),
                inputText("Numeric 2.2",   "2.2"),
                inputText("Numeric -2.25", "-2.25"),
                inputText("Bool true",     "true"),
                inputText("Bool false",    "false"),
                inputText("Null",          "null"),
                inputText("String",        "text is always string"),
                inputText("Empty",         ""),
            ]);
        });

        it("with no options returns strings by default", function() {
            obj = $form.serializeJSON({}); // empty object should be translated to default options
            expect(obj).toEqual({
                "Numeric 0":     "0",
                "Numeric 1":     "1",
                "Numeric 2.2":   "2.2",
                "Numeric -2.25": "-2.25",
                "Bool true":     "true",
                "Bool false":    "false",
                "Null":          "null",
                "String":        "text is always string",
                "Empty":         ""
            });
        });

        it("raises a descriptive error if the option is invalid", function() {
            expect(function(){ $form.serializeJSON({invalidOption: true}); })
                .toThrow(new Error("serializeJSON ERROR: invalid option 'invalidOption'. Please use one of checkboxUncheckedValue, useIntKeysAsArrayIndex, skipFalsyValuesForTypes, skipFalsyValuesForFields, disableColonTypes, customTypes, defaultTypes, defaultType"));
        });

        describe("skipFalsyValuesForFields", function() {
            it("skips serialization of falsy values but only on inputs with given names", function() {
                obj = $form.serializeJSON({skipFalsyValuesForFields: ["Empty", "Null", "Numeric 0", "String"]});
                expect(obj).toEqual({
                    "Numeric 0":     "0", // "0" as :string is not falsy
                    "Numeric 1":     "1",
                    "Numeric 2.2":   "2.2",
                    "Numeric -2.25": "-2.25",
                    "Bool true":     "true",
                    "Bool false":    "false",
                    "Null":          "null", // "null" as :string is not falsy
                    "String":        "text is always string"
                    // "Empty" skip
                });
            });
        });

        describe("skipFalsyValuesForTypes", function() {
            it("skips serialization of falsy values for on inputs of the given types", function() {
                var $form2 = form([
                    inputText("Num0:number",         "0"),
                    inputText("Num1:number",         "1"),
                    inputText("NaN:number",          "wololoo"),
                    inputText("Num0attr",            "0").attr("data-value-type", "number"),
                    inputText("Num1attr",            "1").attr("data-value-type", "number"),
                    inputText("Bool true:boolean",   "true"),
                    inputText("Bool false:boolean",  "false"),
                    inputText("Text:string",         "text is always string"),
                    inputText("Empty String:string", ""),
                    inputText("Empty Implicit",      ""), // :string type is implicit
                    inputText("Array:array",         "[1, 2]"),
                    inputText("Empty Array:array",   "[]"),
                    inputText("Null:null",           "null"),
                ]);

                obj = $form2.serializeJSON({skipFalsyValuesForTypes: ["number", "boolean", "string", "array", "null"]});
                expect(obj["Num0"]).toEqual(undefined); // skip
                expect(obj["Num1"]).toEqual(1);
                expect(obj["NaN"]).toEqual(undefined); // skip
                expect(obj["Num0attr"]).toEqual(undefined); // skip
                expect(obj["Num1attr"]).toEqual(1);
                expect(obj["Bool true"]).toEqual(true);
                expect(obj["Bool false"]).toEqual(undefined); // skip
                expect(obj["Text"]).toEqual("text is always string");
                expect(obj["Empty String"]).toEqual(undefined);
                expect(obj["Empty Implicit"]).toEqual(undefined);
                expect(obj["Array"]).toEqual([1, 2]);
                expect(obj["Empty Array"]).toEqual([]); // Not skip! empty arrays are not falsy
                expect(obj["Null"]).toEqual(undefined); // skip

                obj = $form2.serializeJSON({skipFalsyValuesForTypes: ["number"]}); // skip only falsy numbers
                expect(obj["Num0"]).toEqual(undefined); // skip
                expect(obj["Num1"]).toEqual(1);
                expect(obj["NaN"]).toEqual(undefined); // skip
                expect(obj["Num0attr"]).toEqual(undefined); // skip
                expect(obj["Num1attr"]).toEqual(1);
                expect(obj["Bool true"]).toEqual(true);
                expect(obj["Bool false"]).toEqual(false);
                expect(obj["Text"]).toEqual("text is always string");
                expect(obj["Empty String"]).toEqual("");
                expect(obj["Empty Implicit"]).toEqual("");
                expect(obj["Array"]).toEqual([1, 2]);
                expect(obj["Empty Array"]).toEqual([]);
                expect(obj["Null"]).toEqual(null);
            });
        });

        describe("checkboxUncheckedValue", function() {
            it("uses that value for unchecked checkboxes", function() {
                $form = form([
                    inputCheckbox("check1", "yes"),
                    inputCheckbox("check2", "yes"),
                    inputCheckbox("check3", "yes").prop("checked", true),
                ]);

                obj = $form.serializeJSON({checkboxUncheckedValue: "NOPE"});
                expect(obj).toEqual({check1: "NOPE", check2: "NOPE", check3: "yes"});
            });

            it("is overriden by data-unchecked-value attribute", function() {
                $form = form([
                    inputCheckbox("check1", "yes"),
                    inputCheckbox("check2", "yes").attr("data-unchecked-value", "OVERRIDE"),
                    inputCheckbox("check3", "yes").prop("checked", true),
                ]);

                obj = $form.serializeJSON({checkboxUncheckedValue: "NOPE"});
                expect(obj).toEqual({check1: "NOPE", check2: "OVERRIDE", check3: "yes"});
            });

            if ($.fn.jquery) { // not supported on Zepto
                it("works on multiple forms and inputs", function() {
                    var $form1, $form2, $els;
                    $form1 = form([
                        inputText("form1[title]", "form1"),
                        inputCheckbox("form1[check1]", "true"),
                        inputCheckbox("form1[check2]", "true").attr("data-unchecked-value", "NOPE"),
                    ]);
                    $form2 = form([
                        inputText("form2[title]", "form2"),
                        inputCheckbox("form2[check1]", "true").prop("checked", true),
                        inputCheckbox("form2[check2]", "true"),
                    ]);
                    var $inputs = $()
                        .add(inputText("inputs[title]",  "inputs"))
                        .add(inputCheckbox("inputs[check1]", "true").prop("checked", true))
                        .add(inputCheckbox("inputs[check2]", "true"))
                        .add(inputCheckbox("inputs[check3]", "true").attr("data-unchecked-value", "NOPE"));
                    $els = $form1.add($form2).add($inputs);

                    obj = $els.serializeJSON({checkboxUncheckedValue: "false"});
                    expect(obj).toEqual({
                        form1: {
                            title: "form1",
                            check1: "false",
                            check2: "NOPE",
                        },
                        form2: {
                            title: "form2",
                            check1: "true",
                            check2: "false"
                        },
                        inputs: {
                            title: "inputs",
                            check1: "true",
                            check2: "false",
                            check3: "NOPE"
                        }
                    });
                });
            }

            it("works on a list of checkboxes", function() {
                $form = $("<form>" +
                  "<label class=\"checkbox-inline\">" +
                  "  <input type=\"checkbox\" name=\"flags[]\" value=\"input1\"> Input 1" +
                  "</label>" +
                  "<label class=\"checkbox-inline\">" +
                  "  <input type=\"checkbox\" name=\"flags[]\" value=\"input2\"> Input 2" +
                  "</label>" +
                  "</form>");
                obj = $form.serializeJSON({checkboxUncheckedValue: "false"});
                expect(obj).toEqual({
                    "flags": ["false", "false"]
                });

                $form.find("input[value=\"input1\"]").prop("checked", true);
                obj = $form.serializeJSON({checkboxUncheckedValue: "false"});
                expect(obj).toEqual({
                    "flags": ["input1", "false"]
                });
            });

            it("works on a nested list of checkboxes", function() {
                $form = form([
                    inputText("form[title]",   "list of checkboxes"),
                    inputCheckbox("form[check][]", "true").prop("checked", true),
                    inputCheckbox("form[check][]", "true"),
                    inputCheckbox("form[check][]", "true").attr("data-unchecked-value" ,"NOPE"),
                ]);
                obj = $form.serializeJSON({checkboxUncheckedValue: "false"});
                expect(obj).toEqual({
                    form: {
                        title: "list of checkboxes",
                        check: ["true", "false", "NOPE"]
                    }
                });
            });

            it("works on a nested list of objects", function() {
                $form = form([
                    inputCheckbox("answers[][correct]:boolean", "true").attr("data-unchecked-value", "false"),
                    inputText("answers[][text]", "Blue"),

                    inputCheckbox("answers[][correct]:boolean", "true").attr("data-unchecked-value", "false"),
                    inputText("answers[][text]", "Green"),

                    inputCheckbox("answers[][correct]:boolean", "true").attr("data-unchecked-value", "false").prop("checked", true),
                    inputText("answers[][text]", "Red"),
                ]);
                obj = $form.serializeJSON({checkboxUncheckedValue: "false"});
                expect(obj).toEqual({
                    answers: [
                        {correct: false, text: "Blue"},
                        {correct: false, text: "Green"},
                        {correct: true, text: "Red"},
                    ],
                });
            });

            it("does not serialize disabled checkboxes", function() {
                $form = form([
                    inputCheckbox("checkDisabled1", "true").prop("disabled", true),
                    inputCheckbox("checkDisabled2", "true").prop("disabled", true).attr("data-unchecked-value", "NOPE"),
                ]);
                obj = $form.serializeJSON({checkboxUncheckedValue: "false"});
                expect(obj).toEqual({});
            });
        });

        describe("useIntKeysAsArrayIndex", function() {
            it("uses int keys as array indexes instead of object properties", function() {
                $form = form([
                    inputText("foo[0]", "0"),
                    inputText("foo[1]", "1"),
                    inputText("foo[5]", "5"),
                ]);

                obj = $form.serializeJSON({useIntKeysAsArrayIndex: false}); // default
                expect(obj).toEqual({"foo": {"0": "0", "1": "1", "5": "5"}});

                obj = $form.serializeJSON({useIntKeysAsArrayIndex: true}); // with option useIntKeysAsArrayIndex true
                expect(obj).toEqual({"foo": ["0", "1", undefined, undefined, undefined, "5"]});
            });

            it("works with nested arrays", function() {
                $form = form([
                    inputText("foo[0][bar][0]", "foo0bar0"),
                    inputText("foo[1][bar][0]", "foo1bar0"),
                    inputText("foo[1][bar][1]", "foo1bar1"),
                ]);

                obj = $form.serializeJSON({useIntKeysAsArrayIndex: true});
                expect(obj).toEqual({"foo": [
                    {"bar": ["foo0bar0"]},
                    {"bar": ["foo1bar0", "foo1bar1"]},
                ]});
            });

            it("does not get confused by attribute names that are similar to integers, but not valid array indexes", function() { // only integers are mapped to an array
                $form = form([
                    inputText("drinks[1st]", "coffee"),
                    inputText("drinks[2nd]", "beer"),
                ]);

                obj = $form.serializeJSON({useIntKeysAsArrayIndex: true});
                expect(obj).toEqual({ drinks: {"1st": "coffee", "2nd": "beer"} });
            });

            it("regresion for github issue #69", function() {
                $form = form([
                    $("<input name=\"array[0][value]\" value=\"value\">"),
                ]);
                obj = $form.serializeJSON({useIntKeysAsArrayIndex: true});
                expect(obj).toEqual({"array": [{"value": "value"}]});
            });
        });

        describe("customTypes", function() {
            it("serializes value according to custom function without disturbing default types", function() {
                $form = form([
                    inputText("foo:alwaysBoo",   "0"),

                    inputText("notype",           "default type is :string"),
                    inputText("string:string",    ":string type overrides parsing options"),
                    inputText("excludes:skip",    "Use :skip to not include this field in the result"),

                    inputText("number[1]:number",           "1"),
                    inputText("number[1.1]:number",         "1.1"),
                    inputText("number[other stuff]:number", "other stuff"),

                    inputText("boolean[true]:boolean",      "true"),
                    inputText("boolean[false]:boolean",     "false"),
                    inputText("boolean[0]:boolean",         "0"),

                    inputText("null[null]:null",            "null"),
                    inputText("null[other stuff]:null",     "other stuff"),

                    inputText("array[empty]:array",         "[]"),
                    inputText("array[not empty]:array",     "[1, 2, 3]"),

                    inputText("object[empty]:object",       "{}"),
                    inputText("object[not empty]:object",   "{\"my\": \"stuff\"}"),
                ]);

                obj = $form.serializeJSON({
                    customTypes: {
                        alwaysBoo: function() { return "Boo"; }
                    }
                });

                expect(obj).toEqual({
                    "foo": "Boo",

                    "notype": "default type is :string",
                    "string": ":string type overrides parsing options",
                    // :skip type removes the field from the output
                    "number": {
                        "1": 1,
                        "1.1": 1.1,
                        "other stuff": NaN, // <-- Other stuff parses as NaN (Not a Number)
                    },
                    "boolean": {
                        "true": true,
                        "false": false,
                        "0": false, // <-- "false", "null", "undefined", "", "0" parse as false
                    },
                    "null": {
                        "null": null, // <-- "false", "null", "undefined", "", "0" parse as null
                        "other stuff": "other stuff"
                    },
                    "array": { // <-- works using JSON.parse
                        "empty": [],
                        "not empty": [1,2,3]
                    },
                    "object": { // <-- works using JSON.parse
                        "empty": {},
                        "not empty": {"my": "stuff"}
                    }
                });
            });

            it("type functions receive the value and the DOM element of the field that is being parsed", function() {
                $form = form([
                    inputText("foo1:withXoxo", "luv"),
                    inputText("foo2:withXoxo", "luv").attr("data-Xoxo", "CustomPassedXoxo"),
                    inputText("foo3:multiply", "3").attr("data-multiply", "5"),
                ]);
                obj = $form.serializeJSON({
                    customTypes: {
                        withXoxo: function(val, el) {
                            var xoxo = $(el).attr("data-Xoxo") || "Xoxo";
                            return val + xoxo;
                        },
                        multiply: function(val, el) {
                            var mult = $(el).attr("data-multiply");
                            return Number(val) * Number(mult);
                        },
                    }
                });
                expect(obj).toEqual({
                    "foo1": "luvXoxo",
                    "foo2": "luvCustomPassedXoxo",
                    "foo3": 15 // 3 * 5
                });
            });

            it("overrides defaultTypes", function() {
                $form = form([
                    inputText("incremented:number", "0"),
                ]);
                obj = $form.serializeJSON({
                    customTypes: {
                        number: function(str) { return Number(str) + 1; }
                    }
                });
                expect(obj).toEqual({ "incremented": 1 });
            });

            it("overrides defaultTypes even if they are re-defined", function() {
                $form = form([
                    inputText("num:number", "0"),
                ]);

                obj = $form.serializeJSON({
                    defaultTypes: {
                        number: function() { return 1; }
                    }
                });
                expect(obj).toEqual({ "num": 1 });

                obj = $form.serializeJSON({
                    defaultTypes: {
                        number: function() { return 1; }
                    },
                    customTypes: {
                        number: function() { return 22; }
                    }
                });
                expect(obj).toEqual({ "num": 22 });
            });
        });

        it("can override :string type to change the default parsing function", function() {
            $form = form([
                inputText("foo", "var"),
                inputText("empty", ""),
            ]);

            // default
            obj = $form.serializeJSON();
            expect(obj).toEqual({ "foo": "var", "empty": ""});

            // with custom :string type function
            obj = $form.serializeJSON({
                customTypes: {
                    string: function(str) { return str || null; }
                }
            });
            expect(obj).toEqual({ "foo": "var", "empty": null});
        });

        describe("defaultType", function() {
            it("uses the specified type as default if no other type is defined", function() {
                $form = form([
                    inputText("notype",         "0"),
                    inputText("foo:alwaysBoo",  "0"),
                    inputText("string:string",  ":string overrides default option"),
                    inputText("excludes:skip",  "Use :skip to not include this field in the result"),
                    inputText("fooData",        "0").attr("data-value-type", "alwaysBoo"),
                    inputText("foostr::kaka",   "string from data attr").attr("data-value-type", "string"),
                ]);

                obj = $form.serializeJSON({
                    defaultType: "number",
                    customTypes: {
                        alwaysBoo: function() { return "Boo"; }
                    }
                });

                expect(obj).toEqual({
                    "notype": 0, // parsed with "number", used as default type
                    "foo": "Boo",
                    "string": ":string overrides default option",
                    // :skip type removes the field from the output
                    "fooData": "Boo",
                    "foostr::kaka": "string from data attr"
                });
            });

            it("can be specified to be a custom type function", function() {
                $form = form([
                    inputText("notype",           "0"),
                    inputText("string:string",    ":string overrides default option"),
                ]);

                obj = $form.serializeJSON({
                    defaultType: "alwaysBoo",
                    customTypes: {
                        alwaysBoo: function() { return "Boo"; }
                    }
                });
                expect(obj).toEqual({
                    "notype": "Boo", // parsed with "alwaysBoo", used as default type
                    "string": ":string overrides default option",
                });
            });

            it("raises an error if the type function is not specified", function() {
                $form = form([
                    inputText("fookey", "fooval"),
                ]);
                expect(function(){
                    $form.serializeJSON({ defaultType: "not_a_valid_type" });
                }).toThrow(new Error("serializeJSON ERROR: Invalid type not_a_valid_type found in input name 'fookey', please use one of string, number, boolean, null, array, object, skip"));
            });
        });


        describe("disableColonTypes", function() {
            it("ignores type suffixes from input names", function() {
                $form = form([
                    inputText("foo",              "bar"),
                    inputText("notype::foobar",   "foobar"),
                    inputText("string:string",    "keeps full input name"),
                    inputText("excludes:skip",    "not skip because is not parsed as a type"),
                ]);

                obj = $form.serializeJSON({ disableColonTypes: true });
                expect(obj).toEqual({
                    "foo": "bar", // nothing special over here
                    "notype::foobar": "foobar", // colons are no special now
                    "string:string": "keeps full input name",
                    "excludes:skip": "not skip because is not parsed as a type"
                });
            });
            it("still respects default type function and data-value-type attributes if specified", function() {
                $form = form([
                    inputText("notype",           "0"),
                    inputText("foo:alwaysBoo",    "0"),
                    inputText("string:string",    "99"),
                    inputText("excludes:skip",    "666"),
                    inputText("fooData",          "0").attr("data-value-type", "alwaysBoo"),
                    inputText("foostr::kaka",     "string from data attr").attr("data-value-type", "string"),
                ]);

                obj = $form.serializeJSON({
                    disableColonTypes: true,
                    defaultType: "number",
                    customTypes: {
                        alwaysBoo: function() { return "Boo"; }
                    }
                });
                expect(obj).toEqual({
                    "notype": 0, // parsed with "number", used as default type
                    "foo:alwaysBoo": 0,
                    "string:string": 99,
                    "excludes:skip": 666,

                    "fooData": "Boo", // data-value-type still works to define other types
                    "foostr::kaka": "string from data attr"
                });
            });
        });

        describe("with defaultOptions", function() {
            var defaults = $.serializeJSON.defaultOptions;
            afterEach(function() {
                $.serializeJSON.defaultOptions = defaults; // restore defaults
            });

            it("can be overriden with different options", function() {
                $form = form([
                    inputText("num0:number", "0"),
                    inputText("num1:number", "1"),
                    inputText("empty", ""),
                ]);

                $.serializeJSON.defaultOptions = {skipFalsyValuesForFields: ["num0", "num1", "empty"]};
                obj = $form.serializeJSON();
                expect(obj).toEqual({
                    // "num0":  0, // skip
                    "num1":     1, // not skip because it is not falsy
                    // "empty": "" // skip,
                });

                obj = $form.serializeJSON({skipFalsyValuesForFields: ["num0"]});
                expect(obj).toEqual({
                    // "num0": 0, // skip
                    "num1":    1, // not skip because it is not falsy
                    "empty":   "" // not skip because the default option was override
                });
            });

            it("allows to set default for checkboxUncheckedValue", function() {
                var $checkForm = form([
                    inputCheckbox("check1", "true").prop("checked", true),
                    inputCheckbox("check2", "true"),
                    inputCheckbox("check3", "true").attr("data-unchecked-value", "unchecked_from_data_attr"),
                ]);

                $.serializeJSON.defaultOptions = {checkboxUncheckedValue: "unchecked_from_defaults"};
                obj = $checkForm.serializeJSON(); // with defaults
                expect(obj).toEqual({
                    "check1": "true",
                    "check2": "unchecked_from_defaults",
                    "check3": "unchecked_from_data_attr"
                });

                obj = $checkForm.serializeJSON({checkboxUncheckedValue: "unchecked_from_option"}); // override defaults
                expect(obj).toEqual({
                    "check1": "true",
                    "check2": "unchecked_from_option",
                    "check3": "unchecked_from_data_attr"
                });
            });
        });
    });
});

// splitType
describe("$.serializeJSON.splitType", function() {
    var splitType = $.serializeJSON.splitType;
    it("returns an object with type and nameWithNoType properties form the name with :type colon notation", function() {
        expect(splitType("foo")).toEqual(["foo", ""]);
        expect(splitType("foo:boolean")).toEqual(["foo", "boolean"]);
        expect(splitType("foo[bar]:null")).toEqual(["foo[bar]", "null"]);
        expect(splitType("foo[my::key]:string")).toEqual(["foo[my::key]", "string"]);
    });
});

// splitInputNameIntoKeysArray
describe("$.serializeJSON.splitInputNameIntoKeysArray", function() {
    var split = $.serializeJSON.splitInputNameIntoKeysArray;
    it("accepts a simple name", function() {
        expect(split("foo")).toEqual(["foo"]);
    });
    it("accepts a name wrapped in brackets", function() {
        expect(split("[foo]")).toEqual(["foo"]);
    });
    it("accepts names separated by brackets", function() {
        expect(split("foo[inn][bar]")).toEqual(["foo", "inn", "bar"]);
        expect(split("foo[inn][bar][0]")).toEqual(["foo", "inn", "bar", "0"]);
    });
    it("accepts empty brakets as empty strings", function() {
        expect(split("arr[][bar]")).toEqual(["arr", "", "bar"]);
        expect(split("arr[][][bar]")).toEqual(["arr", "", "", "bar"]);
        expect(split("arr[][bar][]")).toEqual(["arr", "", "bar", ""]);
    });
    it("accepts nested brackets", function() {
        expect(split("foo[inn[bar]]")).toEqual(["foo", "inn", "bar"]);
        expect(split("foo[inn[bar[0]]]")).toEqual(["foo", "inn", "bar", "0"]);
        expect(split("[foo[inn[bar[0]]]]")).toEqual(["foo", "inn", "bar", "0"]);
        expect(split("foo[arr[]]")).toEqual(["foo", "arr", ""]);
        expect(split("foo[bar[arr[]]]")).toEqual(["foo", "bar", "arr", ""]);
    });
});

// deepSet
// Assigns nested keys like "address[state][abbr]" to an object
describe("$.serializeJSON.deepSet", function() {
    var deepSet = $.serializeJSON.deepSet;
    var arr, obj, v, v2;

    beforeEach(function() {
        obj = {};
        arr = [];
        v = "v";
        v2 = "v2";
    });

    it("simple attr ['foo']", function() {
        deepSet(obj, ["foo"], v);
        expect(obj).toEqual({foo: v});
    });

    it("simple attr ['foo'] twice should set the last value", function() {
        deepSet(obj, ["foo"], v);
        deepSet(obj, ["foo"], v2);
        expect(obj).toEqual({foo: v2});
    });

    it("nested attr ['inn', 'foo']", function() {
        deepSet(obj, ["inn", "foo"], v);
        expect(obj).toEqual({inn: {foo: v}});
    });

    it("nested attr ['inn', 'foo'] twice should set the last value", function() {
        deepSet(obj, ["inn", "foo"], v);
        deepSet(obj, ["inn", "foo"], v2);
        expect(obj).toEqual({inn: {foo: v2}});
    });

    it("multiple assign attr ['foo'] and ['inn', 'foo']", function() {
        deepSet(obj, ["foo"], v);
        deepSet(obj, ["inn", "foo"], v);
        expect(obj).toEqual({foo: v, inn: {foo: v}});
    });

    it("very nested attr ['inn', 'inn', 'inn', 'foo']", function() {
        deepSet(obj, ["inn", "inn", "inn", "foo"], v);
        expect(obj).toEqual({inn: {inn: {inn: {foo: v}}}});
    });

    it("array push with empty index, if repeat same object element key then it creates a new element", function() {
        deepSet(arr, [""], v);        //=> arr === [v]
        deepSet(arr, ["", "foo"], v); //=> arr === [v, {foo: v}]
        deepSet(arr, ["", "bar"], v); //=> arr === [v, {foo: v, bar: v}]
        deepSet(arr, ["", "bar"], v); //=> arr === [v, {foo: v, bar: v}, {bar: v}]
        expect(arr).toEqual([v, {foo: v, bar: v}, {bar: v}]);
    });

    it("array push with empty index and empty value, also creates a new element", function() {
        deepSet(arr, ["", "foo"], ""); //=> arr === [{foo: ''}]
        deepSet(arr, ["", "foo"], ""); //=> arr === [{foo: ''}, {foo: ''}, {foo: v}]
        deepSet(arr, ["", "foo"], v);  //=> arr === [{foo: ''}, {foo: ''}, {foo: v}]
        deepSet(arr, ["", "foo"], ""); //=> arr === [{foo: ''}, {foo: ''}, {foo: v}, {foo: ''}]
        expect(arr).toEqual([{foo: ""}, {foo: ""}, {foo: v}, {foo: ""}]);
    });

    it("array assign with empty index should push the element", function() {
        deepSet(arr, [""], 1);
        deepSet(arr, [""], 2);
        deepSet(arr, [""], 3);
        expect(arr).toEqual([1,2,3]);
    });

    it("nested array assign with empty index should push the element", function() {
        deepSet(obj, ["arr", ""], 1);
        deepSet(obj, ["arr", ""], 2);
        deepSet(obj, ["arr", ""], 3);
        expect(obj).toEqual({arr: [1,2,3]});
    });

    it("nested arrays with empty indexes should push the elements to the most deep array", function() {
        deepSet(arr, ["", "", ""], 1);
        deepSet(arr, ["", "", ""], 2);
        deepSet(arr, ["", "", ""], 3);
        expect(arr).toEqual([[[1, 2, 3]]]);
    });

    it("nested arrays with nested objects shuold push new objects only when the nested key already exists", function() {
        deepSet(arr, ["", "name", "first"], "Bruce");
        expect(arr).toEqual([
            {name: {first: "Bruce"}}
        ]);
        deepSet(arr, ["", "name", "last"], "Lee");
        expect(arr).toEqual([
            {name: {first: "Bruce", last: "Lee"}}
        ]);
        deepSet(arr, ["", "age"], 33);
        expect(arr).toEqual([
            {name: {first: "Bruce", last: "Lee"}, age: 33}
        ]);

        deepSet(arr, ["", "name", "first"], "Morihei");
        expect(arr).toEqual([
            {name: {first: "Bruce", last: "Lee"}, age: 33},
            {name: {first: "Morihei"}}
        ]);
        deepSet(arr, ["", "name", "last"], "Ueshiba");
        expect(arr).toEqual([
            {name: {first: "Bruce", last: "Lee"}, age: 33},
            {name: {first: "Morihei", last: "Ueshiba"}}
        ]);
        deepSet(arr, ["", "age"], 86);
        expect(arr).toEqual([
            {name: {first: "Bruce", last: "Lee"}, age: 33},
            {name: {first: "Morihei", last: "Ueshiba"}, age: 86}
        ]);
    });

    describe("with useIntKeysAsArrayIndex option", function(){
        var intIndx = {useIntKeysAsArrayIndex: true};

        it("simple array ['0']", function() {
            arr = [];
            deepSet(arr, ["0"], v);
            expect(arr).toEqual([v]); // still sets the value in the array because the 1st argument is an array

            arr = [];
            deepSet(arr, ["0"], v, intIndx);
            expect(arr).toEqual([v]);
        });

        it("nested simple array ['arr', '0']", function() {
            obj = {};
            deepSet(obj, ["arr", "0"], v);
            expect(obj).toEqual({"arr": {"0": v}});

            obj = {};
            deepSet(obj, ["arr", "0"], v, intIndx);
            expect(obj).toEqual({"arr": [v]});
        });

        it("nested simple array multiple values", function() {
            obj = {};
            deepSet(obj, ["arr", "1"], v2);
            deepSet(obj, ["arr", "0"], v);
            expect(obj).toEqual({"arr": {"0": v, "1": v2}});

            obj = {};
            deepSet(obj, ["arr", "1"], v2, intIndx);
            deepSet(obj, ["arr", "0"], v, intIndx);
            expect(obj).toEqual({"arr": [v, v2]});
        });

        it("nested arrays with indexes should create a matrix", function() {
            arr = [];
            deepSet(arr, ["0", "0", "0"], 1);
            deepSet(arr, ["0", "0", "1"], 2);
            deepSet(arr, ["0", "1", "0"], 3);
            deepSet(arr, ["0", "1", "1"], 4);
            deepSet(arr, ["1", "0", "0"], 5);
            deepSet(arr, ["1", "0", "1"], 6);
            deepSet(arr, ["1", "1", "0"], 7);
            deepSet(arr, ["1", "1", "1"], 8);
            expect(arr).toEqual([{ "0": {"0": 1, "1": 2}, "1": {"0": 3, "1": 4}}, {"0": {"0": 5, "1": 6}, "1": {"0": 7, "1": 8}}]);

            arr = [];
            deepSet(arr, ["0", "0", "0"], 1, intIndx);
            deepSet(arr, ["0", "0", "1"], 2, intIndx);
            deepSet(arr, ["0", "1", "0"], 3, intIndx);
            deepSet(arr, ["0", "1", "1"], 4, intIndx);
            deepSet(arr, ["1", "0", "0"], 5, intIndx);
            deepSet(arr, ["1", "0", "1"], 6, intIndx);
            deepSet(arr, ["1", "1", "0"], 7, intIndx);
            deepSet(arr, ["1", "1", "1"], 8, intIndx);
            expect(arr).toEqual([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
        });

        it("nested object as array element ['arr', '0', 'foo']", function() {
            obj = {};
            deepSet(obj, ["arr", "0", "foo"], v);
            expect(obj).toEqual({arr: {"0": {foo: v}}});

            obj = {};
            deepSet(obj, ["arr", "0", "foo"], v, intIndx);
            expect(obj).toEqual({arr: [{foo: v}]});
        });

        it("array of objects", function(){
            obj = {};
            deepSet(obj, ["arr", "0", "foo"], v);
            deepSet(obj, ["arr", "0", "bar"], v);
            deepSet(obj, ["arr", "1", "foo"], v2);
            deepSet(obj, ["arr", "1", "bar"], v2);
            expect(obj).toEqual({"arr": {"0": {foo: v, bar: v}, "1": {foo: v2, bar: v2}}});

            obj = {};
            deepSet(obj, ["arr", "0", "foo"], v, intIndx);
            deepSet(obj, ["arr", "0", "bar"], v, intIndx);
            deepSet(obj, ["arr", "1", "foo"], v2, intIndx);
            deepSet(obj, ["arr", "1", "bar"], v2, intIndx);
            expect(obj).toEqual({"arr": [{foo: v, bar: v}, {foo: v2, bar: v2}]});
        });

        it("nested arrays mixing empty indexes with numeric indexes should push when using empty but assign when using numeric", function() {
            obj = {};
            deepSet(obj, ["arr", "", "0", ""], 1);
            deepSet(obj, ["arr", "", "1", ""], 2);
            deepSet(obj, ["arr", "", "0", ""], 3);
            deepSet(obj, ["arr", "", "1", ""], 4);
            expect(obj).toEqual({"arr": [{"0": [1, 3], "1": [2, 4]}]});

            obj = {};
            deepSet(obj, ["arr", "", "0", ""], 1, intIndx);
            deepSet(obj, ["arr", "", "1", ""], 2, intIndx);
            deepSet(obj, ["arr", "", "0", ""], 3, intIndx);
            deepSet(obj, ["arr", "", "1", ""], 4, intIndx);
            expect(obj).toEqual({"arr": [[[1, 3], [2, 4]]]});
        });

        it("should set all different nested values", function() {
            deepSet(obj, ["foo"], v, intIndx);
            deepSet(obj, ["inn", "foo"], v, intIndx);
            deepSet(obj, ["inn", "arr", "0"], v, intIndx);
            deepSet(obj, ["inn", "arr", "1"], v2, intIndx);
            deepSet(obj, ["inn", "arr", "2", "foo"], v, intIndx);
            deepSet(obj, ["inn", "arr", "2", "bar"], v), intIndx;
            deepSet(obj, ["inn", "arr", ""], v, intIndx);
            deepSet(obj, ["inn", "arr", ""], v2, intIndx);
            deepSet(obj, ["inn", "arr", "", "foo"], v2, intIndx);
            deepSet(obj, ["inn", "arr", "", "bar"], v2, intIndx);
            deepSet(obj, ["inn", "arr", "2", "inn", "foo"], v, intIndx);
            expect(obj).toEqual({foo: v, inn: {foo: v, arr: [v, v2, {foo: v, bar: v, inn: {foo: v}}, v, v2, {foo: v2, bar: v2}]}});
        });
    });
});


// Test helpers

function form(inputs) {
    return withAppended($("<form>"), inputs);
}

function withAppended($el, innerEls) {
    innerEls.forEach(function($nestedEl){
        $el.append($nestedEl);
    });
    return $el;
}

function inputText(name, value) {
    return $("<input>").attr({type: "text", name: name, value: value});
}

function inputHidden(name, value) {
    return $("<input>").attr({type: "hidden", name: name, value: value});
}

function inputCheckbox(name, value) {
    return $("<input>").attr({type: "checkbox", name: name, value: value});
}

function inputSelect(name, options) {
    return withAppended($("<select>").attr("name", name), options);
}

function inputSelectMultiple(name, options) {
    return withAppended($("<select multiple>").attr("name", name), options);
}

function selectOption(value) {
    return $("<option>").attr("value", value).text(value);
}
