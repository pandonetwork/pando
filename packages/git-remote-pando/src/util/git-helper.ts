import fs from "fs-extra";
import path from "path";
import zlib from "zlib";
import shell from "shelljs";
import { SmartBuffer } from "smart-buffer";
import gitP from "simple-git/promise";

const git = gitP();

import Helper from "../helper";

export default class GitHelper {
  public helper: Helper;

  constructor(helper: Helper) {
    this.helper = helper;
  }

  public debug(message: string): void {
    this.helper.debug(message);
  }

  public async path(oid: string): Promise<string> {
    const subdirectory = oid.substring(0, 2);
    const filename = oid.substring(2);

    return path.join(this.helper.path, "objects", subdirectory, filename);
  }

  public async exists(oid: string): Promise<boolean> {
    return await fs.pathExists(await this.path(oid));
  }

  public async load(oid: string): Promise<any> {
    console.error("Loading: " + oid);
    // const path = await this.path(oid);
    const type = shell
      .exec(`git cat-file -t ${oid}`, { silent: true })
      .stdout.trim();
    const size = shell
      .exec(`git cat-file -s ${oid}`, { silent: true })
      .stdout.trim();
    // if (type === "tree") {
    //   shell
    //     .exec(`git cat-file ${type} ${oid}`, {
    //       silent: true
    //     })
    //     .stdout.trim();
    // }
    // const data = SmartBuffer.fromBuffer(
    //   Buffer.from(
    //     shell
    //       .exec(`git cat-file ${type} ${oid}`, {
    //         silent: true
    //       })
    //       .stdout.trim(),
    //     "binary"
    //   )
    // );

    const data = await git.binaryCatFile([type, oid]);

    // console.error("TYPE");
    // console.error(type);
    // console.error("SIZE");
    // console.error(size);
    // console.error("DATA");
    // console.error(data.toString());
    // const buffer = zlib.inflateSync(Buffer.from(raw));
    const raw = new SmartBuffer();
    raw.writeString(`${type} `);
    raw.writeString(size);
    raw.writeUInt8(0);
    if (type === "commit") {
      raw.writeString(data.toString());
    } else {
      // console.error("Write Buffer");
      raw.writeBuffer(data);
    }

    const node = await this.helper.ipld.deserialize(raw.toBuffer());
    // console.error("NODE");
    // console.error(node);

    return node;
  }

  public async collect(oid: string): Promise<any> {
    let mapping: any = {};
    // console.error("Collecting: " + oid);
    const node: any = await this.load(oid);

    // console.error("NODE IS");
    // console.error(node);

    if (node.gitType === "commit") {
      // node is a commit
      const [_cid, _node, _mapping] = await this.collect(
        this.helper.ipld.cidToSha(node["tree"]["/"])
      );
      const cid = await this.helper.ipld.cid(node);
      mapping = { ...mapping, ..._mapping };

      return [cid, node, { ...mapping, ...{ [cid]: node } }];
    } else if (Buffer.isBuffer(node)) {
      // node is a blob
      const cid = await this.helper.ipld.cid(node);

      return [cid, node, { [cid]: node }];
    } else {
      // node is a tree
      for (let entry in node) {
        // console.error(
        //   "Gonna collect entry " +
        //     entry +
        //     " in tree: " +
        //     this.helper.ipld.cidToSha(node[entry]["hash"]["/"])
        // );
        const [_cid, _node, _mapping] = await this.collect(
          this.helper.ipld.cidToSha(node[entry]["hash"]["/"])
        );
        mapping = { ...mapping, ...{ [_cid]: _node }, ..._mapping };
      }
      const cid = await this.helper.ipld.cid(node);

      return [cid, node, { ...mapping, ...{ [cid]: node } }];
    }
  }

  public async dump(oid: string, node: any): Promise<void> {
    const path = await this.path(oid);
    const buffer = await this.helper.ipld.serialize(node);
    await fs.ensureFile(path);
    fs.writeFileSync(path, zlib.deflateSync(buffer));
  }

  public async download(oid: any): Promise<void> {
    // this._debug('downloading', oid)

    if (await this.exists(oid)) return;

    const cid = this.helper.ipld.shaToCid(oid);
    const node = await this.helper.ipld.get(cid);

    if (node.gitType === "commit") {
      await this.download(this.helper.ipld.cidToSha(node["tree"]["/"]));

      for (let parent of node.parents) {
        await this.download(this.helper.ipld.cidToSha(parent["/"]));
      }

      await this.dump(oid, node);
    } else if (Buffer.isBuffer(node)) {
      // node is a blob
      await this.dump(oid, node);
    } else {
      // node is a tree
      for (let entry in node) {
        await this.download(
          await this.helper.ipld.cidToSha(node[entry]["hash"]["/"])
        );
      }

      await this.dump(oid, node);
    }
  }
}
