import * as inquirer from "inquirer";
import ETHProvider from "eth-provider";
import ora from "ora";
import chalk from "chalk";
import Web3 from "web3";

const FRAME_ENDPOINT = "ws://localhost:1248";
const FRAME_ORIGIN = "pando";

const _timeout = async (duration: any): Promise<void> => {
  return new Promise<any>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};

/* tslint:disable:object-literal-sort-keys */
const questions = {
  ethereum: {
    type: {
      name: "result",
      type: "list",
      message: "How do you want to connect to Ethereum",
      choices: ["Frame", "Direct connection [requires an unlocked account]"],
      default: "Frame"
    },
    gateway: {
      name: "result",
      type: "input",
      message: "Ethereum gateway",
      default: "ws://localhost:8545"
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
  }
};
/* tslint:enable:object-literal-sort-keys */

export const prompt = {
  configure: async (): Promise<any> => {
    const configuration = {
      ethereum: {
        account: undefined as any,
        gateway: undefined as any
      }
    };

    const type = (await inquirer.prompt(questions.ethereum.type)).result;

    if (type === "Frame") {
      configuration.ethereum.gateway = FRAME_ENDPOINT;
    } else {
      configuration.ethereum.gateway = (await inquirer.prompt(
        questions.ethereum.gateway
      )).result;
    }

    const provider = ETHProvider(configuration.ethereum.gateway);
    const message =
      type === "Frame"
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
