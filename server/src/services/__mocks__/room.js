const mockCreateRoom = jest.fn();
const roomId = 'roomId';

mockCreateRoom.mockReturnValue({
  id: roomId
});

module.exports = {
  createRoom: mockCreateRoom
};
