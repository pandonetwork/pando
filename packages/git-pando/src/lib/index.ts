import _ from "lodash";
import ETHProvider from "eth-provider";
import TruffleContract from "truffle-contract";
import OrganizationFactory from "./organization/factory";
import RepositoryFactory from "./repository/factory";
import PandoError from "./error";
import { APMOptions, Gateway, IPandoOptions, PandoOptions } from "./types";

const _artifacts = [
  "Kernel",
  "ACL",
  "PandoKit",
  "PandoColony",
  "PandoRepository"
].map(name => {
  switch (name) {
    case "PandoKit":
      return require(`@pando/kit/build/contracts/${name}.json`);
    case "PandoColony":
      return require(`@pando/colony/build/contracts/${name}.json`);
    case "PandoRepository":
      return require(`@pando/repository/build/contracts/${name}.json`);
    default:
      return require(`@aragon/os/build/contracts/${name}.json`);
  }
});

const _defaults = (options: IPandoOptions): PandoOptions => {
  const apm = _.defaultsDeep(options.apm, {
    ens: "0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1"
  });

  const provider = ETHProvider(options.ethereum.gateway);

  return { ethereum: { account: options.ethereum.account, provider }, apm };
};

export default class Pando {
  public static async create(options: IPandoOptions): Promise<Pando> {
    const pando = new Pando(_defaults(options));
    await pando._initialize();

    return pando;
  }

  public options: PandoOptions;
  public organizations: OrganizationFactory;
  public repositories: RepositoryFactory;

  public contracts: any;

  constructor(options: PandoOptions) {
    this.options = options;
    this.organizations = new OrganizationFactory(this);
    this.repositories = new RepositoryFactory(this);

    this.contracts = Object.assign(
      {},
      ..._artifacts
        .map(artifact => TruffleContract(artifact))
        .map(contract => ({ [contract._json.contractName]: contract }))
    );
  }

  public async close(): Promise<void> {
    if (typeof this.options.ethereum.provider.connection !== "undefined") {
      this.options.ethereum.provider.connection.close();
    }
  }

  private async _initialize(): Promise<Pando> {
    for (const contract in this.contracts) {
      if (this.contracts.hasOwnProperty(contract)) {
        this.contracts[contract].setProvider(this.options.ethereum.provider);
        this.contracts[contract].defaults({
          from: this.options.ethereum.account,
          gas: 30e6,
          gasPrice: 15000000001
        });
      }
    }

    return this;
  }
}
