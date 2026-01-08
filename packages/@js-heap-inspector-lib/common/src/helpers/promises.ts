/**
 * Sleeps for given milliseconds
 *
 * @param milliseconds
 */
export async function sleep(milliseconds: number) {
  await new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}
