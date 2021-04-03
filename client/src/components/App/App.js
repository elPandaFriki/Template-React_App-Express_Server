import React from "react";
import logo from "./logo.svg";
import "./App.css";
import io from "socket.io-client";
import { TextField, Button } from "@material-ui/core";
import jwt from "jsonwebtoken";
import _ from "lodash";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {},
      usersConnected: null,
      users: [],
    };
  }

  onInputChange = (e) => {
    const { value, id } = e.target;
    const { fields } = this.state;
    this.setState({
      fields: {
        ...fields,
        [id]: {
          ...(this.state[id] != null
            ? this.state[id]
            : {
                help: "",
              }),
          value,
        },
      },
    });
  };

  componentDidMount() {
    this.connectSocket();
  }

  connectSocket = (newToken = null) => {
    const { fields } = this.state;
    let token = sessionStorage.getItem("token");
    if (newToken != null) token = newToken;
    const socket = io.connect(`${window.location.hostname}:4000`, {
      query: `token=${token}`,
      extraHeaders: {
        username: _.get(
          fields,
          "user.value",
          sessionStorage.getItem("username")
        ),
        Authorization: `Bearer ${token}`,
      },
    });
    window.socket = socket;
    socket.on("connect", () => {
      this.setState({
        socketConnected: true,
      });
    });
    socket.on("USERS_CONNECTED", (payload) => {
      this.setState({
        usersConnected: payload.size,
        users: payload.data,
      });
    });
  };

  onSubmit = () => {
    const { fields } = this.state;
    const token = jwt.sign(
      `${fields.user.value}_${fields.password.value}`,
      process.env.JWT_TOKEN || "placeholder_jwt"
    );
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", fields.user.value);
    this.connectSocket(token);
  };

  onKeyPress = (e) => {
    if (e.code !== "Enter") return true;
    e.preventDefault();
    const { fields } = this.state;
    let results = {};
    for (let fieldName in fields) {
      const fieldValue = fields[fieldName];
      if (fieldValue.value.length === 0) {
        results[fieldName] = {};
        results[fieldName].help = "This field is required";
      }
    }
    for (let item in this.props.menuData) {
      const { id } = this.props.menuData[item];
      if (fields[id] == null || fields[id].value.length === 0) {
        results[id] = {};
        results[id].help = "This field is required";
      }
    }
    if (Object.keys(results).length === 0) {
      this.onSubmit();
      return;
    }
    for (let id in results) {
      if (!fields[id]) fields[id] = {};
      fields[id].value = results[id].value || fields[id].value || "";
      fields[id].help = results[id].help || fields[id].help || "";
    }
    this.setState({
      fields,
    });
  };

  disconnectSocket = () => {
    window.socket.emit("FORCE_DISCONNECT");
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    const { socketConnected, fields, usersConnected, users } = this.state;
    const items = Object.values(this.props.menuData);
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {socketConnected ? (
            <div>
              <Button onClick={this.disconnectSocket}>DISCONNECT</Button>
            </div>
          ) : (
            <form onKeyPress={this.onKeyPress}>
              {items.map((item) => {
                if (item.type === "text" || item.type == null)
                  return (
                    <div key={item.id}>
                      <TextField
                        error={
                          fields[item.id] != null &&
                          fields[item.id].help.length > 0
                        }
                        helperText={
                          fields[item.id] != null && fields[item.id].help
                        }
                        name={item.id}
                        id={item.id}
                        onChange={this.onInputChange}
                        label={item.label}
                        type={"text"}
                        value={
                          fields[item.id] != null ? fields[item.id].value : ""
                        }
                        variant={"outlined"}
                        size={"small"}
                      />
                    </div>
                  );
                return null;
              })}
            </form>
          )}
          <div className="socketStatus">
            <span>Log Status</span>
            {socketConnected ? (
              <span className="socketStatus-On">ON</span>
            ) : (
              <span className="socketStatus-Off">OFF</span>
            )}
          </div>
          <div>
            {usersConnected != null && (
              <span>USERS CONNECTED: {usersConnected}</span>
            )}
            {users.map(user => {
              return <p>
                {user.username}
              </p>
            })}
          </div>
        </header>
      </div>
    );
  }
}

App.defaultProps = {
  menuData: [
    {
      id: "user",
      label: "username",
    },
    {
      id: "password",
      label: "password",
    },
  ],
};

export default App;
