import { Agent, callable } from "agents";

export type CounterState = {
  count: number;
};

export class CounterAgent extends Agent<Cloudflare.Env, CounterState> {
  initialState: CounterState = { count: 0 };

  onRequest(request: Request): Promise<Response> | Response {
    return Response.json({ count: this.state.count, url: request.url });
  }

  @callable()
  increment() {
    this.setState({ count: this.state.count + 1 });
    return this.state.count;
  }

  @callable()
  decrement() {
    this.setState({ count: this.state.count - 1 });
    return this.state.count;
  }
}
