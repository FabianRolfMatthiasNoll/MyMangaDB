import React from "react";
import "./App.css";
import { Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
// https://mui.com/material-ui/getting-started/installation/
// https://github.com/callFEELD/react-example
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          <Button variant="contained" endIcon={<SendIcon />}>
            Send
          </Button>
        </p>
      </header>
    </div>
  );
}
export default App;
