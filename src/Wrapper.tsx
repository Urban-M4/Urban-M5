import { parseAsString, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { Button } from "./components/ui/button";
import { App } from "./App";

export function Wrapper() {
  const [streetscapesWebServiceUrl] = useQueryState("s", parseAsString);

  if (streetscapesWebServiceUrl === null) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold">
          Welcome to the streetscapes explorer
        </h1>
        <p>
          Please enter the URL of the Streetscapes Web Service to get started.
        </p>
        <form method="get" className="flex flex-col gap-4">
          <Input
            type="text"
            name="s"
            placeholder="http://localhost:5000"
            required
          />
          <Button type="submit">Submit</Button>
        </form>
        <div>
          <p>The web service can be started with:</p>
          <pre className="bg-muted p-4 rounded overflow-x-auto">
            <code>{`pip install streetscapes[explorer]
# Use streetscapes subcommands to 
# fetch metadata, download images and perform segmentation.
streetscapes-explorer`}</code>
          </pre>
        </div>
      </div>
    );
  }

  return <App />;
}
export default Wrapper;
