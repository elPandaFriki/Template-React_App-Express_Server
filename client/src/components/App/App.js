import React from "react";
import logo from "./logo.svg";
import "./App.css";
import io from "socket.io-client";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socketConnected: false,
    };
  }

  componentDidMount() {
    const socket = io(`${window.location.hostname}:4000`, {});
    socket.on("connect", () => {
      window.socket = socket;
      this.setState({
        socketConnected: true,
      });
    });
    socket.on("disconnect", () => {
      this.setState({
        socketConnected: false,
      });
    });
  }

  render() {
    const { socketConnected } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p className="socketStatus">
            <span>Socket Status</span>
            {socketConnected ? (
              <span className="socketStatus-On">ON</span>
            ) : (
              <span className="socketStatus-Off">OFF</span>
            )}
          </p>
        </header>
      </div>
    );
  }
}

export default App;
