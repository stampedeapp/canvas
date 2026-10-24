/* Safe state-level regression: no malformed stream or exploit payload. */
#include <stdio.h>
#include <string.h>
#include "c/dec/decode.c"

int main(void) {
  BrotliDecoderState* state = BrotliDecoderCreateInstance(NULL, NULL, NULL);
  if (!state) return 2;
  /* Allocate the same table storage used by the normal stream initializer. */
  state->block_type_trees = (HuffmanCode*)BROTLI_DECODER_ALLOC(state,
      3 * (BROTLI_HUFFMAN_MAX_SIZE_258 + BROTLI_HUFFMAN_MAX_SIZE_26) * sizeof(HuffmanCode));
  if (!state->block_type_trees) { BrotliDecoderDestroyInstance(state); return 2; }
  state->block_len_trees = state->block_type_trees + 3 * BROTLI_HUFFMAN_MAX_SIZE_258;
  for (int tree = 0; tree < 3; tree++) {
    state->num_block_types[tree] = 1;
    for (int safe = 0; safe <= 1; safe++) {
      int actual = DecodeBlockTypeAndLength(safe, state, tree);
      if (actual != -17) {
        fprintf(stderr, "tree=%d safe=%d: expected BLOCK_SWITCH (-17), got %d\n", tree, safe, actual);
        BrotliDecoderDestroyInstance(state);
        return 1;
      }
    }
  }
  if (DecodeLiteralBlockSwitchInternal(0, state) != -17 ||
      DecodeLiteralBlockSwitchInternal(1, state) != -17 ||
      DecodeCommandBlockSwitchInternal(0, state) != -17 ||
      DecodeCommandBlockSwitchInternal(1, state) != -17 ||
      DecodeDistanceBlockSwitchInternal(0, state) != -17 ||
      DecodeDistanceBlockSwitchInternal(1, state) != -17) return 4;
  if (strcmp(BrotliDecoderErrorString((BrotliDecoderErrorCode)-17), "BLOCK_SWITCH") != 0) return 3;
  BrotliDecoderDestroyInstance(state);
  puts("PASS: all six invalid block-switch states return BLOCK_SWITCH (-17)");
  return 0;
}
