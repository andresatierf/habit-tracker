import { CompletionSlice, ImmerStateCreator } from "./types";

export const createCompletionStore: ImmerStateCreator<CompletionSlice> = (
  set,
) => ({
  completion: {
    metadata: null,
    setMetadata: (metadata) =>
      set(
        (state) => {
          state.completion.metadata = metadata;
        },
        undefined,
        "store:completion/setMetadata",
      ),
  },
});
