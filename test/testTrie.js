var should = require("should");
var combomgr = require("../combo");

var TrieNode = combomgr.TrieNode;

// Workaround for converting should statements to expressions
function e(statement) {
    "use strict";
    return statement;
}

describe('TrieNode', function() {
    describe('#TrieNode/0', function() {
        var trie = new TrieNode();
        it('should set trie.value to nothing', function() {
            should.not.exist(trie.value);
        });
        it('should not set trie.data to anything', function() {
            should.not.exist(trie.parent);
        });
        it('should not set trie.data to anything', function() {
            should.not.exist(trie.data);
        });
    });
    describe('#TrieNode/1', function() {
        var trie = new TrieNode("a");
        it('should set trie.value to "a"', function() {
            trie.value.should.equal("a");
        });
        it('should not set trie.data to anything', function() {
            should.not.exist(trie.parent);
        });
        it('should not set trie.data to anything', function() {
            should.not.exist(trie.data);
        });
    });
    describe('#TrieNode/2', function() {
        var parentTrie = new TrieNode("a");
        var trie = new TrieNode("b", parentTrie);
        it('should set trie.value to "b"', function() {
            trie.value.should.equal("b");
        });
        it('should set trie.parent to parentTrie', function() {
            trie.parent.should.equal(parentTrie);
        });
        it('should not set o.data to anything', function() {
            should.not.exist(trie.data);
        });
    });
    describe('#TrieNode/3', function() {
        var data = function() { return "Same function"; };
        var parentTrie = new TrieNode("a");
        var trie = new TrieNode("b", parentTrie, data);
        it('should set trie.value to "b"', function() {
            trie.value.should.equal("b");
        });
        it('should set trie.parent to parentTrie', function() {
            trie.parent.should.equal(parentTrie);
        });
        it('should set trie.data to data', function() {
            trie.data.should.eql(data);
        });
    });
    describe('#isLeaf/0', function() {
        it('should be a leaf after creation', function() {
            var trie = new TrieNode("a");
            e(trie.isLeaf().should.be.true);
        });
        it('should not be a leaf if there is a child', function() {
            var trie = new TrieNode("a");
            var child = new TrieNode("child");
            trie.children["child"] = child;
            e(trie.isLeaf().should.be.false);
        });
    });
    describe('#add/2', function() {
        it('should be empty prior to adding anything', function() {
            var trie = new TrieNode("a");
            e(trie.isLeaf().should.be.true);
        });
        describe("b added as a child", function() {
            var trie = new TrieNode("a");
            trie.add(["b"], "bdata");
            it('should exist', function() {
                trie.children.should.have.keys("b");
            });
            var b = trie.children["b"];
            it('should have "bdata" as data', function() {
                b.data.should.equal("bdata");
            });
            it('should have "b" as its value', function() {
                b.value.should.equal("b");
            });
            it('should have a as its parent', function() {
                b.parent.should.equal(trie);
            });
            it('should have preserve as false', function() {
                e(b.metadata.preserve.should.be.false);
            });
        });
        describe("a after adding empty sequence", function() {
            var trie = new TrieNode("a");
            trie.add([], "adata");
            it('should have no children', function() {
                e(trie.isLeaf().should.be.true);
            });
            it('should have "adata" as data', function() {
                trie.data.should.equal("adata");
            });
        });
        describe("a after adding many nodes", function() {
            var trie = new TrieNode("a");
            trie.add(["b", "c", "d"], "ddata");

            // Checking that children appear where they should
            it('should only have b as a child', function() {
                trie.children.should.have.keys("b");
            });
            var b = trie.children["b"];
            it('should only have c as a child of b', function() {
                b.children.should.have.keys("c");
            });
            var c = b.children["c"];
            it('should only have d as a child of c', function() {
                c.children.should.have.keys("d");
            });
            var d = c.children["d"];

            // Checking that the values of each node are correct
            it('should have "b" as its value', function() {
                b.value.should.equal("b");
            });
            it('should have "c" as its value', function() {
                c.value.should.equal("c");
            });
            it('should have "d" as its value', function() {
                d.value.should.equal("d");
            });

            // Checking parents
            it('should have a as parent of b', function() {
                b.parent.should.equal(trie);
            });
            it('should have b as parent of c', function() {
                c.parent.should.equal(b);
            });
            it('should have c as parent of d', function() {
                d.parent.should.equal(c);
            });

            // Checking data membership
            it('should not set the data of a', function() {
                should.not.exist(trie.data);
            });
            it('should not set the data of b', function() {
                should.not.exist(b.data);
            });
            it('should not set the data of c', function() {
                should.not.exist(c.data);
            });
            it('should set the data of d to "ddata"', function() {
                d.data.should.equal("ddata");
            });
        });
        describe("a after adding two branches similar at the head", function() {
            var trie = new TrieNode("a");
            trie.add(["b", "c", "d"], "ddata");
            trie.add(["b", "c", "e"], "edata");

            // Checking that children appear where they should
            it('should only have b as a child', function() {
                trie.children.should.have.keys("b");
            });
            var b = trie.children["b"];
            it('should only have c as a child of b', function() {
                b.children.should.have.keys("c");
            });
            var c = b.children["c"];
            it('should only only have d and e as children of c', function() {
                c.children.should.have.keys("d", "e");
            });
            var d = c.children["d"];
            var e = c.children["e"];

            // Checking data membership
            it('should set the data of d to "ddata"', function() {
                d.data.should.equal("ddata");
            });
            it('should set the data of e to "edata"', function() {
                e.data.should.equal("edata");
            });
        });
        describe("a after adding two branches different at the head", function() {
            var trie = new TrieNode("a");
            trie.add(["b", "c", "d"], "bdata");
            trie.add(["e", "c", "d"], "edata");

            // Checking that children appear where they should
            it('should have b and e as children', function() {
                trie.children.should.have.keys("b", "e");
            });
            var b = trie.children["b"];
            var e = trie.children["e"];
            it('should only have c as a child of b', function() {
                b.children.should.have.keys("c");
            });
            it('should only have c as a child of e', function() {
                e.children.should.have.keys("c");
            });
            var bc = b.children["c"];
            var ec = e.children["c"];
            it('should only have d as a child of bc', function() {
                bc.children.should.have.keys("d");
            });
            it('should only have d as a child of ec', function() {
                ec.children.should.have.keys("d");
            });
            var bcd = bc.children["d"];
            var ecd = ec.children["d"];

            // Checking data membership
            it('should set the data of bcd to "bdata"', function() {
                bcd.data.should.equal("bdata");
            });
            it('should set the data of ecd to "edata"', function() {
                ecd.data.should.equal("edata");
            });
        });
    });
    describe('#add/3', function() {
        describe("b added as a child", function() {
            var trie = new TrieNode("a");
            trie.add(["hey", "b"], "bdata", { index : 1, preserve : true });
            it('should exist', function() {
                trie.children.should.have.keys("b");
            });
            var b = trie.children["b"];
            it('should have preserve as true', function() {
                e(b.metadata.preserve.should.be.true);
            });
        });
        describe("nothing added as a child", function() {
            var trie = new TrieNode("a");
            trie.add(["hey", "b"], "adata", { index : 2 });
            it('should have no children', function() {
                e(trie.isLeaf().should.be.true);
            });
        });
    });
    describe("#get/1", function() {
        var trie = new TrieNode("a");
        trie.add(["b", "c", "d", "e", "f"], "fdata");
        trie.add(["b", "c", "h", "i", "j"], "jdata");
        it("should get the f node given bcdef", function() {
            var f = trie.get(["b", "c", "d", "e", "f"]);
            f.value.should.equal("f");
        });
        it("should get the j node given bchij", function() {
            var j = trie.get(["b", "c", "h", "i", "j"]);
            j.value.should.equal("j");
        });
        it("should get undefined if sequence doesn't exist", function() {
            var f = trie.get(["c", "c", "d", "e", "f"]);
            should.not.exist(f);
        });
        it("should get undefined if short sequence doesn't exist", function() {
            var f = trie.get(["c", "c"]);
            should.not.exist(f);
        });
        it("should get undefined if similar sequence doesn't exist", function() {
            var j = trie.get(["b", "c", "d", "e", "j"]);
            should.not.exist(j);
        });
        describe("getting an intermediate node", function() {
            var c = trie.get(["b", "c"]);
            it("should get the c node" , function() {
                c.value.should.equal("c");
            });
            it("should have d and h as children" , function() {
                c.children.should.have.keys("d", "h");
            });
        });
        describe("getting the first child node", function() {
            var b = trie.get(["b"]);
            it("should get the b node" , function() {
                b.value.should.equal("b");
            });
            it("should have c as its child" , function() {
                b.children.should.have.keys("c");
            });
        });

    });
});