import * as inquirer from "inquirer";
import ETHProvider from "eth-provider";
import Web3 from "web3";
import ora from "ora";
import chalk from "chalk";
import * as display from "./display";

const FRAME_ENDPOINT = "ws://localhost:1248";
const FRAME_ORIGIN = "AragonCLI";

const _url = (configuration): any => {
  return (
    configuration.ethereum.gateway.protocol +
    "://" +
    configuration.ethereum.gateway.host +
    ":" +
    configuration.ethereum.gateway.port
  );
};

const _timeout = async (duration: any): Promise<void> => {
  return new Promise<any>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};

const questions = {
  /* tslint:disable:object-literal-sort-keys */
  ethereum: {
    frame: {
      name: "result",
      type: "list",
      message: "How do you want to connect to Ethereum",
      choices: ["Frame", "Direct connection [requires an unlocked account]"],
      default: "Frame"
    },
    gateway: {
      protocol: {
        name: "result",
        type: "list",
        message: "Ethereum gateway protocol",
        choices: ["ws", "ipc"],
        default: "ws"
      },
      host: {
        name: "result",
        type: "input",
        message: "Ethereum gateway host",
        default: "localhost"
      },
      port: {
        name: "result",
        type: "input",
        message: "Ethereum gateway port",
        default: "8545"
      }
    },
    account: (accounts: string[]): any => {
      const question = {
        name: "result",
        type: "list",
        message: "Ethereum account",
        choices: accounts,
        default: 0
      };
      return question;
    }
    // account: async (provider: any): Promise<any> => {
    //   const question = {
    //     name: 'result',
    //     type: 'list',
    //     message: 'Ethereum account',
    //     choices: async (): Promise<string[]> => {
    //       const web3 = new Web3(provider)
    //       const accounts = await web3.eth.getAccounts()
    //       return accounts
    //     },
    //     default: 0,
    //   }
    //   return question
    // },
  }
};

export const prompt = {
  configure: async (): Promise<any> => {
    const configuration = {
      ethereum: {
        connection: undefined as any,
        account: undefined,
        gateway: {
          protocol: undefined,
          host: undefined,
          port: undefined
        }
      }
    };

    configuration.ethereum.connection =
      (await inquirer.prompt(questions.ethereum.frame)).result === "Frame"
        ? "frame"
        : "direct";

    if (configuration.ethereum.connection !== "frame") {
      configuration.ethereum.gateway.protocol = (await inquirer.prompt(
        questions.ethereum.gateway.protocol
      )).result;
      configuration.ethereum.gateway.host = (await inquirer.prompt(
        questions.ethereum.gateway.host
      )).result;
      configuration.ethereum.gateway.port = (await inquirer.prompt(
        questions.ethereum.gateway.port
      )).result;
    }

    const provider =
      configuration.ethereum.connection === "frame"
        ? ETHProvider(FRAME_ENDPOINT)
        : ETHProvider(_url(configuration));
    const message =
      configuration.ethereum.connection === "frame"
        ? chalk.bold("Connecting to Frame")
        : chalk.bold("Connecting to Ethereum gateway");
    const spinner = ora(message).start();

    while (true) {
      try {
        const accounts = await provider.send("eth_accounts");
        spinner.stop();
        configuration.ethereum.account = (await inquirer.prompt(
          await questions.ethereum.account(accounts)
        )).result;
        break;
      } catch (err) {
        spinner.text = message + " " + chalk.red(err.message);
        await _timeout(2000);
      }
    }

    provider.connection.close();

    return configuration;
  }
};

export default prompt;
