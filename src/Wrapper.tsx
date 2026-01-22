import { parseAsString, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { App } from "./App";

export function Wrapper() {
  const [streetscapesWebServiceUrl] = useQueryState("s", parseAsString);

  if (streetscapesWebServiceUrl === null) {
    return (
      <form method="get" className="p-4">
        <Label>
          Streetscapes Web Service URL:
          <Input
            type="text"
            name="s"
            placeholder="http://localhost:5000"
            required
          />
        </Label>
        <Button type="submit">Submit</Button>
      </form>
    );
  }

  return <App />;
}
export default Wrapper;
