import { h } from "../../lib/index.esm.js";

const App = {
  setup() {
    return {
      msg: "mini-vue",
    };
  },

  render() {
    return h("div", null, "hello " + "world");
  },
};

export default App;
