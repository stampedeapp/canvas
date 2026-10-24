#include <stdio.h>
#include <string.h>
#include <brotli/decode.h>
int main(void) {
  const char* error = BrotliDecoderErrorString((BrotliDecoderErrorCode)-17);
  if (strcmp(error, "BLOCK_SWITCH") != 0) {
    fprintf(stderr, "Compiled Brotli decoder returned %s for -17\n", error);
    return 1;
  }
  puts("PASS: compiled Brotli archive recognizes BLOCK_SWITCH (-17)");
  return 0;
}
