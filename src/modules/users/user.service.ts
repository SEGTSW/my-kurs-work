import { userRepository } from './user.repository';

export const userService = {
  getAllUsers() {
    return userRepository.findAll();
  },

  makeAdmin(id: number) {
    return userRepository.makeAdmin(id);
  },
};
