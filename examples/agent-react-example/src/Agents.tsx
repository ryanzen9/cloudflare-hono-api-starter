import { useAgent } from "agents/react";
import { useState } from "react";
import { CounterAgent, type CounterState } from "../../../src/agents/counter";

function CounterWidget() {
  const [count, setCount] = useState(0);

  const agent = useAgent<CounterAgent, CounterState>({
    host: process.env.BUN_PUBLIC_API_ORIGIN,
    agent: "counter-agent",
    name: "counter",
    onStateUpdate: (state) => setCount(state.count)
  });

  function handleIncrement() {
    agent.stub.increment!();
  }

  function handleDecrement() {
    agent.stub.decrement!();
  }

  return (
    <>
      {count}
      <button onClick={handleIncrement}>+</button>
      <button onClick={handleDecrement}>-</button>
    </>
  );
}

export default CounterWidget;
