(function() {
"use strict";

function TrieNode(val, parent, data) {
    // The value of a TrieNode is undefined until we add something to it
    this.value = val;
    this.parent = parent;
    this.data = data;
    this.has_data = false;

    this.options = {};
    this.leaf_options = {};

    this.children = {};
}

TrieNode.prototype.add = function(sequence, leafData, index, options, leaf_options) {
    this.options = options || {};
    index = index || 0;

    // At this point, there are no children left
    if (index === sequence.length) {
        this.has_data = true;
        this.data = leafData;
        // These properties are only set if they are leaf nodes
        this.leaf_options = leaf_options || {};
    } else if (index < sequence.length) {
        var token = sequence[index];
        if (!(token in this.children)) {
            this.children[token] = new TrieNode(token, this);
        }
        index += 1;
        this.children[token].add(sequence, leafData, index, options, leaf_options);
    }
};

// Returns the last node associated with this sequence
TrieNode.prototype.get = function(sequence, index) {
    index = index || 0;
    if (index === sequence.length) {
        return this;
    } else if (index < sequence.length) {
        var token = sequence[index];
        var child = this.children[token];
        if (typeof child === "undefined") {
            return undefined;
        }
        return child.get(sequence, index + 1);
    }
    return undefined;
};

TrieNode.prototype.isLeaf = function() {
    if (Object.keys(this.children).length === 0) {
        return true;
    }
    return false;
};

var ComboMgr = {};
ComboMgr.baseTrie = new TrieNode();
ComboMgr.keyBuffer = [];

var keyHeld = {};
var keycodes = {
    8 : "backspace",
    9 : "tab",
    13 : "enter",
    16 : "shift",
    17 : "ctrl",
    18 : "alt",
    20 : "caps",
    27 : "esc",
    32 : "space",
    33 : "pageup",
    34 : "pagedown",
    35 : "end",
    36 : "home",
    37 : "left",
    38 : "up",
    39 : "right",
    40 : "down",
    45 : "insert",
    46 : "delete",
    48 : "0",
    49 : "1",
    50 : "2",
    51 : "3",
    52 : "4",
    53 : "5",
    54 : "6",
    55 : "7",
    56 : "8",
    57 : "9",
    59 : ";",
    61 : "=",
    65 : "a",
    66 : "b",
    67 : "c",
    68 : "d",
    69 : "e",
    70 : "f",
    71 : "g",
    72 : "h",
    73 : "i",
    74 : "j",
    75 : "k",
    76 : "l",
    77 : "m",
    78 : "n",
    79 : "o",
    80 : "p",
    81 : "q",
    82 : "r",
    83 : "s",
    84 : "t",
    85 : "u",
    86 : "v",
    87 : "w",
    88 : "x",
    89 : "y",
    90 : "z",
    96 : "num_0",
    97 : "num_1",
    98 : "num_2",
    99 : "num_3",
    100 : "num_4",
    101 : "num_5",
    102 : "num_6",
    103 : "num_7",
    104 : "num_8",
    105 : "num_9",
    106 : "num_multiply",
    107 : "num_+",
    109 : "num_-",
    110 : "num_.",
    111 : "num_/",
    112 : "F1",
    113 : "F2",
    114 : "F3",
    115 : "F4",
    116 : "F5",
    117 : "F6",
    118 : "F7",
    119 : "F8",
    120 : "F9",
    121 : "F10",
    122 : "F11",
    123 : "F12",
    144 : "num",
    186 : ";",
    187 : "=",
    188 : ",",
    189 : "-",
    190 : ".",
    191 : "/",
    192 : "`",
    219 : "[",
    220 : "\\",
    221 : "]",
    222 : "\'"
};

ComboMgr.advanceBuffer = function(key, time, up) {
    key = key + ":" + (up? "up" : "down");
    // For every trie in the buffer
    for (var i = 0; i < this.keyBuffer.length; i++) {
        // Get the next trie in the buffer
        var trie = this.keyBuffer[i];
        if (typeof trie === 'undefined') {
            continue;
        }
        var timeout = trie.options.timeout || 0;
        var last_time = trie.options.last_time || time;
        if (timeout !== 0) {
            if ((time - last_time) > timeout) {
                // If timeout, delete this element
                delete this.keyBuffer[i];
                continue;
            }
        }
        trie.options.last_time = time;
        // Ignores key up if specified
        if (trie.options.ignoreKeyup && up) {
            return;
        }
        // Get the entry corresponding to the keypress
        // If none exists, next is undefined
        var next = trie.get([key]);
        if (typeof next !== 'undefined') {
            // The sequence was recognized
            if (next.has_data) {
                var preserve = next.leaf_options.preserve || false;
                var propagate = next.leaf_options.propagate || false;

                // Call next.data() since we are storing the callback as data
                next.data();

                if (!preserve && !propagate) {
                    // We don't want future key sequences to build off this
                    // sequence, so we clear the key buffer to prevent
                    // any other subsequences or supersequences from activating
                    this.keyBuffer = [];
                    return;
                } else if (!preserve && propagate) {
                    // We don't want future key sequences to build off this
                    // sequence, but it's okay if existing subsequences or
                    // supersequences can still fire.
                    delete this.keyBuffer[i];
                } else if (preserve && !propagate) {
                    // We want future key sequences to build off this sequence
                    // but we don't want any existing subsequences or
                    // supersequences to fire after this activation, so we
                    // cut off the buffer after this.
                    this.keyBuffer = this.keyBuffer.slice(0, i + 1);
                    return;
                }
                // Otherwise if we want future key sequences to build off this
                // sequence and it's okay if existing subsequences or
                // supersequences fire after this, then no action is necessary
            } else {
                // Advance if this is not a registered node sequuence
                this.keyBuffer[i] = next;
            }
        } else {
            // The sequence was not recognized
            if (!trie.options.fuzzy) {
                // If we don't want fuzzy input
                delete this.keyBuffer[i];
            }
        }
    }
    this.cleanBuffer();
    var newTrie = this.baseTrie.get([key]);
    if (typeof newTrie !== 'undefined') {
        // We need this case to handle single key activations
        if (newTrie.has_data) {
            var nt_preserve = newTrie.leaf_options.preserve || false;
            var nt_propagate = newTrie.leaf_options.propagate || false;

            // Call newTrie.data() since we are storing the callback as data
            newTrie.data();
            if (!nt_propagate) {
                // We don't want any existing subsequences or supersequences
                // to fire after this activation
                this.keyBuffer = [];
            }
            if (!nt_preserve) {
                // We don't want future key sequences to build off this sequence
                return;
            }
        }
        newTrie.options.last_time = time;
        this.keyBuffer.push(newTrie);
    }
};

// Removes deleted elements in the keyBuffer for better performance
ComboMgr.cleanBuffer = function() {
    var len = this.keyBuffer.length,
        newBuffer = [],
        i;

    for (i = 0; i < len; i++) {
        if (typeof this.keyBuffer[i] !== 'undefined') {
            // copy non-empty values to the end of the array
            newBuffer.push(this.keyBuffer[i]);
        }
    }
    this.keyBuffer = newBuffer;
};

ComboMgr.fireKeyDown = function(key, time) {
    this.advanceBuffer(key, time, false);
};
ComboMgr.fireKeyUp = function(key, time) {
    this.advanceBuffer(key, time, true);
};

// API Methods
var Combo = {};

// By default it only handles keydowns and ignores keyups
Combo.on = function(seq, func, opt) {
    seq = this.validateSeq(seq);
    var verboseSeq = seq.map(function(key) {
        return key + ":down";
    });
    opt = opt || {};
    opt.ignoreKeyup = opt.ignoreKeyup || true;
    this.onEvent(verboseSeq, func, opt);
};

// Combo.onEvent
// @arg seq - The combo sequence of keys to handle
// @arg func - The callback function called on combo activation
// @arg opt - A set of options:
//
// Options:
// @opt "preserve" - Set true if future key inputs should still build upon
//                   this sequence. False by default.
//                   This isn't really a big issue unless specifying more keys
//                   should activate another combo. This is intended for
//                   single key combos.
// @opt "fuzzy" - Set true if key combo should not care about any extra
//                keys. Should generally be used with a timeout for combos.
//                False by default.
//                Default behavior is to strictly require sequences to be in
//                a certain order when pressed.
// @opt "propagate" - Set true if activating this combo should still allow
//                    existing subsequences (or supersequences if fuzzy input
//                    is allowed) of this combo to activate. False by default.
//                    Default behavior is to stop processing any potential
//                    sequences after the first activation. If you have a long
//                    sequence that includes multiple keys that also have their
//                    own activations setting this to true will be helpful.
// @opt "timeout" - Any possible sequence will be canceled if a key has not
//                  been activated within the timeout period. 0 by default.
//                  0 means no timeout.
// @opt "ignoreKeyup" - If true, this sequence ignores keyups. Default is false.


Combo.onEvent = function(seq, func, opt) {
    seq = this.validateSeq(seq);
    if (typeof func === 'undefined') {
        throw new TypeError("Please specify the callback function");
    }
    opt = opt || {};
    var options = {};
    var leaf_options = {};

    options.fuzzy = opt.fuzzy || false;
    options.timeout = opt.timeout || 0;
    options.ignoreKeyup = opt.ignoreKeyup || false;

    leaf_options.propagate = opt.propagate || false;
    leaf_options.preserve = opt.preserve || false;
    ComboMgr.baseTrie.add(seq, func, 0, options, leaf_options);
};

Combo.validateSeq = function(seq) {
    if (typeof seq === 'undefined') {
        throw new TypeError("Please specify the combo sequence");
    } else if (typeof seq === 'string') {
        seq = seq.split(">");
    }
    // Remove whitespace from elements of the sequence
    seq = seq.map(function(key) {
        return key.replace(/\s+/g, '');
    });
    return seq;
};

var onKeyDown = function(e) {
    var keycode = e.keyCode;
    var time = (new Date()).getTime();
    if (!(keyHeld[keycode])) {
        keyHeld[keycode] = true;
        var key = keycodes[keycode];
        ComboMgr.fireKeyDown(key, time);
    }
};
var onKeyUp = function(e) {
    var keycode = e.keyCode;
    var time = (new Date()).getTime();
    keyHeld[keycode] = false;
    var key = keycodes[keycode];
    ComboMgr.fireKeyUp(key, time);
};

// Initial setup
if (typeof document !== 'undefined') {
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
}

if (typeof window !== 'undefined') {
    window.Combo = Combo;
}

if (typeof module !== 'undefined') {
    module.exports.TrieNode = TrieNode;
    module.exports.ComboMgr = ComboMgr;
}

}());