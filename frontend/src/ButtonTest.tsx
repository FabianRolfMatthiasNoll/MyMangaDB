import { useState } from "react";

interface ButtonParams {
  value?: string;
  number?: number; // makes optional
}

export default function ButtonTest(params: ButtonParams) {
  const [amount, setAmount] = useState<number>(0);
  return (
    <button onClick={() => setAmount(amount + 1)}>
      Press Me Senpai {amount}
    </button>
  );
}
