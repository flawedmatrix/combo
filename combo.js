(function() {
"use strict";

function TrieNode(val, parent, data) {
    // The value of a TrieNode is undefined until we add something to it
    this.value = val;
    this.parent = parent;
    this.data = data;
    this.metadata = {
        "preserve": false,
    };
    this.children = {};
}

TrieNode.prototype.add = function(sequence, leafData, options) {
    options = options || {};
    var index = options.index || 0;
    // At this point, there are no children left
    if (index === sequence.length) {
        this.data = leafData;
        if (options.preserve) {
            this.metadata.preserve = options.preserve || false;
        }
    } else if (index < sequence.length) {
        var token = sequence[index];
        if (!(token in this.children)) {
            this.children[token] = new TrieNode(token, this);
        }
        options.index = index + 1;
        this.children[token].add(sequence, leafData, options);
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

ComboMgr.advanceBuffer = function(key) {
    for (var i = 0; i < this.keyBuffer.length; i++) {
        var trie = this.keyBuffer[i];
        var next = trie.get([key]);
        if (typeof next !== 'undefined') {
            if (next.isLeaf()) {
                next.data();
                this.keyBuffer = [];
                return;
            } else {
                this.keyBuffer[i] = next;
            }
        }
    }
    var newTrie = this.baseTrie.get([key]);
    if (typeof newTrie !== 'undefined') {
        this.keyBuffer.push(newTrie);
    }
};

ComboMgr.fireKeyDown = function(key) {
    this.advanceBuffer(key);
};
ComboMgr.fireKeyUp = function(key) {
};

// API Methods
var Combo = {};
Combo.on = function(seq, func) {
    ComboMgr.baseTrie.add(seq, func);
};

var onKeyDown = function(e) {
    var keycode = e.keyCode;
    if (!(keyHeld[keycode])) {
        keyHeld[keycode] = true;
        var key = keycodes[keycode];
        ComboMgr.fireKeyDown(key);
    }
};
var onKeyUp = function(e) {
    var keycode = e.keyCode;
    keyHeld[keycode] = false;
    var key = keycodes[keycode];
    ComboMgr.fireKeyUp(key);
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