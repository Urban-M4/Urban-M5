import { parseAsString, useQueryState } from "nuqs";
import { UrbanM5App } from "./components/UrbanM5App";
import { Input } from "@/components/ui/input";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";

export function App() {
  const [streetscapesWebServiceUrl] = useQueryState("s", parseAsString);

  if (streetscapesWebServiceUrl === null) {
    return (
      <form method="get" className="p-4">
        <Label>
          Streetscapes Web Service URL:
          <Input type="text" name="s" placeholder="http://localhost:3000" required/>
        </Label>
        <Button type="submit">Submit</Button>
      </form>
    );
  }

  return <UrbanM5App />;
}
export default App;
