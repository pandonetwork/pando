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

// const _providerFromGateway = (gateway: Gateway): any => {
//   switch (gateway.protocol) {
//     case "ws":
//       return new Web3.providers.WebsocketProvider(
//         "ws://" + gateway.host + ":" + gateway.port
//       );
//     case "http":
//       throw new PandoError("E_DEPRECATED_PROVIDER_PROTOCOL", gateway.protocol);
//     default:
//       throw new PandoError("E_UNKNOWN_PROVIDER_PROTOCOL", gateway.protocol);
//   }
// };

const _url = (options: any) => {
  return options.protocol + "://" + options.host + ":" + options.port;
};

const _defaults = (options: IPandoOptions): PandoOptions => {
  const apm = _.defaultsDeep(options.apm, {
    ens: "0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1"
  });
  const gateway = _.defaultsDeep(options.ethereum.gateway, {
    protocol: "ws",
    host: "localhost",
    port: "8545"
  });
  const provider =
    options.ethereum.connection === "frame"
      ? ETHProvider("frame")
      : ETHProvider(_url(options.ethereum.gateway));

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
