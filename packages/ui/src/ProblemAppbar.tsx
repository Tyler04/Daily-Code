import { TooltipContent } from "@radix-ui/react-tooltip";
import { Button } from "./shad/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger } from "./shad/ui/tooltip";
import { Problem, Track } from "@prisma/client";
import { executeCode } from "@repo/common";
import { Dispatch, MutableRefObject, SetStateAction } from "react";

interface ProblemAppbarProps {
  problem: Problem;
  track: Track & { problems: Problem[] };
  editorRef: MutableRefObject<any>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<boolean>>;
  setOutput: Dispatch<SetStateAction<any>>;
}

export const ProblemAppbar = ({ problem, track, editorRef, setOutput, setLoading, setError }: ProblemAppbarProps) => {
  const problemIndex = track.problems.findIndex((p) => p.id === problem.id);
  return (
    <div className="mt-2 ml-2 mr-2 flex justify-between">
      <div className="flex-1 flex justify">
        {problem.title} {problemIndex + 1} / {track.problems.length}
      </div>
      <div className="flex justify-center content-center flex-1">
        <Button
          variant={"secondary"}
          size={"sm"}
          className="mr-2"
          onClick={async () => {
            const sourceCode = editorRef.current.getValue();
            if (!sourceCode) return;
            try {
              setLoading(true);
              const { run: result } = await executeCode(sourceCode);
              setOutput(result.output.split("\n"));
              result.stderr ? setError(true) : setError(false);
            } catch (error) {
              console.log(error);
            } finally {
              setLoading(false);
            }
          }}
        >
          Run Code
        </Button>
        <Button variant={"secondary"} size={"sm"} className="ml-2 text-green-500">
          Submit Code
        </Button>
      </div>
      <div className="flex flex-1 flex-row-reverse">
        <TooltipProvider>
          <div className="pr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Next {">"}</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Next Lesson</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">{"<"} Prev </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous Lesson</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
