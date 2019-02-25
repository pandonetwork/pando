import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { EmptyStateCard, Main, SidePanel, observe, theme } from "@aragon/ui";
import AppLayout from "./components/AppLayout";
import Browser from "./components/Browser";
import Aragon, { providers } from "@aragon/client";

const repository = {
  name: "aragonAPI",
  address: "0xb4124cEB3451635DAcedd11767f004d8a28c6eE7",
  description: "JS library to interact with Aragon DAOs",
  branches: [
    ["master", "z8mWaJHXieAVxxLagBpdaNWFEBKVWmMiE"],
    ["dev", "z8mWaFhhBAZv6LEcYTHBfiUtAC7cGNgnt"]
  ]
};

class App extends React.Component {
  static defaultProps = {
    branches: []
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  handleMenuPanelOpen = () => {
    // this.props.sendMessageToWrapper('menuPanel', true)
  };

  render() {
    const { branches } = this.props;
    const { sidePanelOpen } = this.state;

    console.log("Branches from app");
    console.log(branches);

    return (
      <div css="min-width: 320px">
        <Main>
          <AppLayout
            title={repository.name}
            onMenuOpen={this.handleMenuPanelOpen}
          >
            <Browser name={repository.name} branches={branches} />
          </AppLayout>
        </Main>
      </div>
    );
  }
}

export default observe(
  observable =>
    observable.map(state => {
      const { branches } = state;
      console.log("Branches from observable: ");
      console.log(branches);

      return {
        ...state,
        branches:
          Object.keys(branches).length > 0
            ? Object.keys(branches).map(key => {
                return [key, branches[key]];
              })
            : []
      };
    }),
  {}
)(App);
