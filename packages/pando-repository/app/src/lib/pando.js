"use strict";
exports.__esModule = true;
var util_js_1 = require("ipld-git/src/util/util.js");
var Commit = /** @class */ (function () {
    function Commit(commit) {
        if (commit.tree.hasOwnProperty('/')) {
            Object.assign(this, commit, {
                cid: commit.tree['/'],
                sha: util_js_1.cidToSha(commit.tree['/'])
            });
        }
    }
    return Commit;
}());
exports["default"] = Commit;
//public static async _fetchModifiedTree(commit: ILinkedDataCommit): Promise<ModifiedC
/** async function fetchModifiedTree(root: Tree): Promise<ModifiedTree> {
  //{ "/" : cid, "/": cid } ---> { "/": lastModified: { date: "datestr", author: "string"}, mode: "int", blob: cid }
  /**return new Promise<ModifiedTree>((resolve, reject) => {
    try {
      const cid = root["/"].cid

      ipld.get(cid, async (err, result) => {
        if (err) {
          reject(err)
        } else {

        }
      })
    } catch (err) {
      reject(err);
    }
  })
} **/
//export default fetchModifiedTree;
//export function convertCommitToIPLDCommit(commit: Commit): IPLDCommit {}
