// describe('description name', () => {
//   test('Test name', () => {
//     expect(1).toBe(2);
//   });
// });

// describe('Testing async', () => {
//   test('test name', (done) => {
//     setTimeout(() => {
//       expect(1).toBe(1);
//       done();
//     }, 2000);
//   });
// });

test('test name', (done) => {
  setTimeout(() => {
    expect(1).toBe(1);
    done();
  }, 2000);
});
