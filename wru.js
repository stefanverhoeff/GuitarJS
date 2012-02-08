var wru = (function (global) {

    // (C) WebReflection - Mit Style License
    // @version 1.0

    // essential unit test framework
    // @see http://webreflection.blogspot.com/2010/09/wru-my-new-tiny-unit-test-library.html

    var

        // a private queue, you never know
        // what could happen out there ...
        queue = [],

        // all I need
        wru = {

            // random test execution order
            random: 0,

            // default node to append results
            node: document.documentElement,

            // basic assert function
            // we decide what is true and what is not
            assert: function (desc, tf) {
                var current = wru.current;
                if (arguments.length == 1) {
                    tf = desc;
                }
                tf ? ++current[!!tf] : current[!!tf].push(desc);
            },

            // yeah, it's unit test time!
            test: function (list) {
                queue = queue.concat(list);
                if (wru.random) {
                    queue.sort(messItUp);
                }
            }
        },

        // the classic way to check properties
        hasOwnProperty = wru.hasOwnProperty
    ;

    // if async.js is in da house, we fake it
    // if not, we don't give a shit about
    // interval 0 since it's always free
    clearInterval(setInterval(exec, 15) - 1);

    // some logic here
    function exec() {
        if (!global.async) {
            var
                current = wru.current,
                test = queue.shift(),
                temp = {},
                name, callback, node, length, setup
            ;
            if (current) {
                if (!hasAnError(current)) {
                    if (hasOwnProperty.call(current, "teardown")) {
                        tryToCallIt(current.teardown, current);
                    } else if (hasOwnProperty.call(wru, "teardown")) {
                        tryToCallIt(wru.teardown, current);
                    }
                }
                node = current.node;
                node.innerHTML = "<strong>" + current.name + "</strong>";
                if (hasAnError(current)) {
                    node.innerHTML += " message: " + current.error;
                    node.className = "error";
                } else {
                    length = current[!1].length;
                    node.innerHTML += " assertions: " + (current[!0] + length);
                    if (length) {
                        node.innerHTML += " failed: " + "(" + length + ") " + current[!1].join(", ");
                        node.className = "fail";
                    } else {
                        node.className = "pass";
                    }
                }
                wru.current = null;
            }
            if (test) {
                if (typeof test == "function") {
                    callback = test;
                    name = test.name || "anonymous";
                    if (hasOwnProperty.call(wru, "setup")) {
                        setup = wru.setup;
                    }
                } else {
                    callback = test.test;
                    name = test.name;
                    if (hasOwnProperty.call(test, "setup")) {
                        setup = test.setup;
                    } else if (hasOwnProperty.call(wru, "setup")) {
                        setup = wru.setup;
                    }
                }
                (wru.current = {
                    node: wru.node.appendChild(document.createElement("div")),
                    name: name,
                    temp: temp,
                    "true": 0,
                    "false": []
                }).node.innerHTML = "... waiting for " + name + " ...";
                if (callback != test && hasOwnProperty.call(test, "teardown")) {
                    wru.current.teardown = test.teardown;
                }
                if (setup) {
                    tryToCallIt(setup, wru.current);
                }
                if (!hasAnError(wru.current)) {
                    tryToCallIt(callback, wru.current);
                }
            }
        }
    }

    // some other here
    function messItUp() {
        return Math.random() < .5 ? -1 : 1;
    }
    function hasAnError(current) {
        return hasOwnProperty.call(current, "error");
    }
    function tryToCallIt(callback, current) {
        try {
            callback(current.temp);
        } catch(e) {
            current.error = e;
        }
    }

    return wru;

}(this));